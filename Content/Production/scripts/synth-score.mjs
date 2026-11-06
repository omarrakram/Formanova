#!/usr/bin/env node
/**
 * Formanova original score and sound design generator.
 *
 * Every sound in both advertisements is synthesised here from first
 * principles (additive, modal and noise synthesis plus a feedback-delay-network
 * reverb). No samples, loops, presets or third-party recordings are used, so
 * the output is original work owned by the commissioning brand and is cleared
 * for paid advertising. Output is deterministic: the same source produces
 * bit-identical WAV files.
 *
 * Musical cues are driven by the creative timelines in src/creatives/*, so
 * accents land exactly on picture cuts.
 *
 * Usage: node scripts/synth-score.mjs [heritage|product|bf-ladder|bf-set|all]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SR = 48000;
const DURATION = 15;
const TARGET_LUFS = -14;
const CEILING_DBTP = -1.2;

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const dbToGain = (db) => Math.pow(10, db / 20);

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** "F#5" -> MIDI note number. */
const midi = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`Bad note name ${name}`);
  const acc = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]] + acc;
};
const freq = (name) => 440 * Math.pow(2, (midi(name) - 69) / 12);

const readTimeline = (name) =>
  JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "src", "creatives", name, "timeline.json"),
      "utf8",
    ),
  );

/** Stereo accumulation bus. */
class Bus {
  constructor(seconds = DURATION + 4) {
    this.length = Math.round(seconds * SR);
    this.L = new Float32Array(this.length);
    this.R = new Float32Array(this.length);
  }
  add(i, l, r) {
    if (i >= 0 && i < this.length) {
      this.L[i] += l;
      this.R[i] += r;
    }
  }
}

/**
 * A mixer channel: writes the dry signal to `dry` and a scaled copy to the
 * reverb `send` bus, so each instrument is synthesised only once.
 */
const channel = (dry, send, sendLevel) => ({
  length: dry.length,
  add(i, l, r) {
    dry.add(i, l, r);
    if (sendLevel > 0) send.add(i, l * sendLevel, r * sendLevel);
  },
});

/** Equal-power pan gains for pan in [-1, 1]. */
const panGains = (pan) => {
  const a = ((pan + 1) / 2) * (Math.PI / 2);
  return [Math.cos(a), Math.sin(a)];
};

/**
 * Sine partial via a rotating phasor (fast and exact for fixed frequency).
 * `env(t)` returns amplitude for time t (seconds after start).
 */
const partial = (bus, start, seconds, f, amp, env, pan, phase = 0) => {
  if (f >= SR * 0.45 || amp <= 0) return;
  const [gl, gr] = panGains(pan);
  const n = Math.round(seconds * SR);
  const w = (TAU * f) / SR;
  const c = Math.cos(w);
  const s = Math.sin(w);
  let x = Math.cos(phase);
  let y = Math.sin(phase);
  const i0 = Math.round(start * SR);
  for (let i = 0; i < n; i++) {
    const v = y * amp * env(i / SR);
    bus.add(i0 + i, v * gl, v * gr);
    const nx = x * c - y * s;
    y = x * s + y * c;
    x = nx;
  }
};

/** Chamberlin state-variable filter, per-sample cutoff. */
class SVF {
  constructor() {
    this.low = 0;
    this.band = 0;
  }
  process(x, cutoff, q) {
    const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR * 0.24)) / SR);
    const high = x - this.low - q * this.band;
    this.band += f * high;
    this.low += f * this.band;
    return { low: this.low, band: this.band, high };
  }
}

/* ------------------------------------------------------------------ */
/* Instruments                                                         */
/* ------------------------------------------------------------------ */

/** Soft felt piano: inharmonic additive partials, two-stage decay, hammer thump. */
const feltPiano = (bus, rand, t, note, vel, hold = 1.6, pan = 0) => {
  const f0 = freq(note);
  const m = midi(note);
  const inharm = 0.00012 * Math.pow(2, (m - 60) / 24);
  const parts = Math.min(16, Math.floor(15000 / f0));
  const ring = hold + 3.2;
  for (let n = 1; n <= parts; n++) {
    const fn = n * f0 * Math.sqrt(1 + inharm * n * n);
    const amp =
      vel *
      0.16 *
      Math.pow(n, -1.05) *
      Math.exp(-(n - 1) * (0.42 - 0.18 * vel));
    const tauFast =
      (0.32 + 1.5 / (1 + 0.45 * (n - 1))) * Math.pow(262 / f0, 0.35);
    const tauSlow = tauFast * 4.5;
    const env = (tt) => {
      const atk = 1 - Math.exp(-tt / 0.005);
      const body =
        0.62 * Math.exp(-tt / tauFast) + 0.38 * Math.exp(-tt / tauSlow);
      const damper = tt < hold ? 1 : Math.exp(-(tt - hold) / 0.35);
      return atk * body * damper;
    };
    const detune = 1 + (rand() - 0.5) * 0.0011;
    partial(bus, t, ring, fn, amp * 0.62, env, pan - 0.08, rand() * TAU);
    partial(
      bus,
      t,
      ring,
      fn * detune,
      amp * 0.38,
      env,
      pan + 0.08,
      rand() * TAU,
    );
  }
  // Felt hammer: a short, dark noise thump.
  const svf = new SVF();
  const [gl, gr] = panGains(pan);
  const i0 = Math.round(t * SR);
  for (let i = 0; i < SR * 0.06; i++) {
    const tt = i / SR;
    const v =
      svf.process(rand() * 2 - 1, 380, 0.9).low *
      vel *
      0.05 *
      Math.exp(-tt / 0.012);
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/** Warm string-like pad: detuned additive saw voices with spectral tilt. */
const pad = (bus, rand, t0, t1, notes, level, opts = {}) => {
  const { attack = 1.2, release = 1.4, tilt = 5.5, spread = 0.55 } = opts;
  const seconds = t1 - t0 + release;
  for (const name of notes) {
    const f0 = freq(name);
    const parts = Math.min(22, Math.floor(9000 / f0));
    for (const [cents, pan] of [
      [-7, -spread],
      [0, 0],
      [6, spread],
    ]) {
      const fv = f0 * Math.pow(2, cents / 1200);
      const lfoRate = 0.11 + rand() * 0.08;
      const lfoPhase = rand() * TAU;
      const env = (tt) => {
        const a = Math.min(1, tt / attack);
        const atk = a * a * (3 - 2 * a);
        const rel =
          tt < t1 - t0 ? 1 : Math.max(0, 1 - (tt - (t1 - t0)) / release);
        const breathe = 1 + 0.09 * Math.sin(TAU * lfoRate * tt + lfoPhase);
        return atk * rel * rel * breathe;
      };
      for (let n = 1; n <= parts; n++) {
        const amp =
          (level / notes.length) * (1 / n) * Math.exp(-(n - 1) / tilt) * 0.34;
        partial(bus, t0, seconds, fv * n, amp, env, pan, rand() * TAU);
      }
    }
  }
};

/** Sub-bass drone with soft second harmonic. */
const sub = (bus, t0, t1, note, level) => {
  const f0 = freq(note);
  const env = (tt) => {
    const a = Math.min(1, tt / 0.9);
    const rel = tt < t1 - t0 ? 1 : Math.max(0, 1 - (tt - (t1 - t0)) / 1.2);
    return a * a * rel;
  };
  partial(bus, t0, t1 - t0 + 1.2, f0, level, env, 0);
  partial(bus, t0, t1 - t0 + 1.2, f0 * 2, level * 0.18, env, 0);
};

/** Clear bell / celesta strike with inharmonic partials. */
const bell = (bus, rand, t, note, level, pan = 0) => {
  const f0 = freq(note);
  const ratios = [1, 2.0, 2.76, 4.07, 5.43, 6.8];
  const amps = [1, 0.42, 0.3, 0.18, 0.1, 0.06];
  const decays = [3.2, 1.6, 1.1, 0.7, 0.45, 0.3];
  ratios.forEach((r, k) => {
    partial(
      bus,
      t,
      decays[k] * 5,
      f0 * r,
      level * amps[k],
      (tt) => (1 - Math.exp(-tt / 0.0015)) * Math.exp(-tt / decays[k]),
      pan,
      rand() * TAU,
    );
  });
};

/** Delicate crystal "ting". */
const glassTing = (bus, rand, t, level, pan = 0.2) => {
  const f0 = 2637;
  [
    [1, 1, 1.0],
    [2.32, 0.5, 0.45],
    [4.25, 0.28, 0.22],
    [6.63, 0.16, 0.12],
  ].forEach(([r, a, d]) =>
    partial(
      bus,
      t,
      d * 6,
      f0 * r,
      level * a,
      (tt) => (1 - Math.exp(-tt / 0.0008)) * Math.exp(-tt / d),
      pan,
      rand() * TAU,
    ),
  );
};

/** Filtered-noise air movement for transitions. */
const whoosh = (
  bus,
  rand,
  t,
  seconds,
  level,
  fromHz,
  toHz,
  panFrom = -0.5,
  panTo = 0.5,
) => {
  const svf = new SVF();
  const n = Math.round(seconds * SR);
  const i0 = Math.round(t * SR);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const cutoff = fromHz * Math.pow(toHz / fromHz, p);
    const shape = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.8)), 2);
    const v = svf.process(rand() * 2 - 1, cutoff, 1.1).band * level * shape;
    const [gl, gr] = panGains(panFrom + (panTo - panFrom) * p);
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/** Soft cinematic low swell/hit (felt timpani-like). */
const lowBoom = (bus, rand, t, level) => {
  const i0 = Math.round(t * SR);
  let phase = 0;
  for (let i = 0; i < SR * 2.2; i++) {
    const tt = i / SR;
    const f = 42 + 30 * Math.exp(-tt / 0.18);
    phase += (TAU * f) / SR;
    const env = (1 - Math.exp(-tt / 0.012)) * Math.exp(-tt / 0.5);
    const v = Math.sin(phase) * env * level;
    bus.add(i0 + i, v, v);
  }
  const svf = new SVF();
  for (let i = 0; i < SR * 0.4; i++) {
    const tt = i / SR;
    const v =
      svf.process(rand() * 2 - 1, 220, 1).low *
      level *
      0.35 *
      Math.exp(-tt / 0.09);
    bus.add(i0 + i, v, v);
  }
};

/** Round, unhurried kick. */
const kick = (bus, rand, t, level) => {
  const i0 = Math.round(t * SR);
  let phase = 0;
  for (let i = 0; i < SR * 0.6; i++) {
    const tt = i / SR;
    const f = 58 + 120 * Math.exp(-tt / 0.028);
    phase += (TAU * f) / SR;
    const env = (1 - Math.exp(-tt / 0.0015)) * Math.exp(-tt / 0.13);
    const v = Math.tanh(Math.sin(phase) * 1.4) * env * level;
    bus.add(i0 + i, v, v);
  }
  const svf = new SVF();
  for (let i = 0; i < SR * 0.01; i++) {
    const v =
      svf.process(rand() * 2 - 1, 3500, 1).band *
      level *
      0.45 *
      Math.exp(-i / (SR * 0.002));
    bus.add(i0 + i, v, v);
  }
};

/** Finger-snap / soft clap. */
const snap = (bus, rand, t, level, pan = 0.1) => {
  const svf = new SVF();
  const i0 = Math.round(t * SR);
  const [gl, gr] = panGains(pan);
  for (let i = 0; i < SR * 0.22; i++) {
    const tt = i / SR;
    const bursts =
      Math.exp(-tt / 0.004) +
      0.7 * (tt > 0.008 ? Math.exp(-(tt - 0.008) / 0.004) : 0) +
      0.5 * (tt > 0.017 ? Math.exp(-(tt - 0.017) / 0.05) : 0);
    const v = svf.process(rand() * 2 - 1, 1900, 0.75).band * bursts * level;
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/** Closed hi-hat tick. */
const hat = (bus, rand, t, level, pan = -0.25) => {
  const svf = new SVF();
  const i0 = Math.round(t * SR);
  const [gl, gr] = panGains(pan);
  for (let i = 0; i < SR * 0.08; i++) {
    const tt = i / SR;
    const v =
      svf.process(rand() * 2 - 1, 9000, 0.6).high *
      Math.exp(-tt / 0.018) *
      level;
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/** Soft-mallet marimba (modal synthesis). */
const marimba = (bus, rand, t, note, level, pan = 0) => {
  const f0 = freq(note);
  [
    [1, 1, 0.55],
    [3.98, 0.32, 0.14],
    [9.14, 0.1, 0.05],
  ].forEach(([r, a, d]) =>
    partial(
      bus,
      t,
      d * 6,
      f0 * r,
      level * a,
      (tt) => (1 - Math.exp(-tt / 0.0025)) * Math.exp(-tt / d),
      pan,
      rand() * TAU,
    ),
  );
};

/** Short, warm bass note. */
const bass = (bus, t, note, seconds, level) => {
  const f0 = freq(note);
  const i0 = Math.round(t * SR);
  let phase = 0;
  const n = Math.round((seconds + 0.08) * SR);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    phase += (TAU * f0) / SR;
    const env =
      (1 - Math.exp(-tt / 0.006)) *
      (0.55 + 0.45 * Math.exp(-tt / 0.12)) *
      (tt < seconds ? 1 : Math.max(0, 1 - (tt - seconds) / 0.08));
    const v =
      Math.tanh(1.6 * (Math.sin(phase) + 0.25 * Math.sin(2 * phase))) *
      env *
      level;
    bus.add(i0 + i, v, v);
  }
};

/** Typewriter key strike, used when a price tag is stamped onto a product. */
const typeClick = (bus, rand, t, level, pan = 0.15) => {
  const svf = new SVF();
  const i0 = Math.round(t * SR);
  const [gl, gr] = panGains(pan);
  let phase = 0;
  for (let i = 0; i < SR * 0.09; i++) {
    const tt = i / SR;
    phase += (TAU * 170) / SR;
    const clack =
      svf.process(rand() * 2 - 1, 2800, 0.35).band * Math.exp(-tt / 0.0045);
    const body = Math.sin(phase) * 0.5 * Math.exp(-tt / 0.018);
    const ping = Math.sin(TAU * 3150 * tt) * 0.12 * Math.exp(-tt / 0.03);
    const v = (clack + body + ping) * level;
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/** Noise-and-tone riser leading into the call to action. */
const riser = (bus, rand, t, seconds, level) => {
  const svf = new SVF();
  const i0 = Math.round(t * SR);
  const n = Math.round(seconds * SR);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const tt = i / SR;
    const cutoff = 500 * Math.pow(14, p);
    phase += (TAU * (220 * Math.pow(3, p))) / SR;
    const amp = Math.pow(p, 2.2) * level;
    const v =
      svf.process(rand() * 2 - 1, cutoff, 0.8).band * amp +
      Math.sin(phase) * amp * 0.12 * (0.5 + 0.5 * Math.sin(TAU * 6 * tt));
    const [gl, gr] = panGains(Math.sin(TAU * 0.8 * tt) * 0.4);
    bus.add(i0 + i, v * gl, v * gr);
  }
};

/* ------------------------------------------------------------------ */
/* Reverb (8-line feedback delay network)                              */
/* ------------------------------------------------------------------ */

const fdnReverb = (
  bus,
  { t60 = 2.2, damping = 0.35, predelay = 0.02, size = 1 },
) => {
  const lens = [1031, 1327, 1523, 1801, 2063, 2333, 2579, 2903].map((x) =>
    Math.round(x * size),
  );
  const lines = lens.map((l) => new Float32Array(l));
  const idx = new Array(8).fill(0);
  const lp = new Float32Array(8);
  const gains = lens.map((l) => Math.pow(10, (-3 * l) / (t60 * SR)));
  const pre = Math.round(predelay * SR);
  const outL = new Float32Array(bus.length);
  const outR = new Float32Array(bus.length);
  const outs = new Float32Array(8);
  // Keep low frequencies out of the reverb so the tail never turns muddy.
  const inputFilter = new SVF();
  for (let i = 0; i < bus.length; i++) {
    const j = i - pre;
    const input = inputFilter.process(
      j >= 0 ? (bus.L[j] + bus.R[j]) * 0.5 : 0,
      180,
      1.41,
    ).high;
    let sum = 0;
    for (let k = 0; k < 8; k++) {
      const o = lines[k][idx[k]];
      lp[k] = (1 - damping) * o + damping * lp[k];
      outs[k] = lp[k];
      sum += lp[k];
    }
    const h = (2 / 8) * sum;
    let l = 0;
    let r = 0;
    for (let k = 0; k < 8; k++) {
      lines[k][idx[k]] = input * 0.35 + (outs[k] - h) * gains[k];
      idx[k] = (idx[k] + 1) % lens[k];
      if (k % 2 === 0) l += outs[k];
      else r += outs[k];
      if (k % 4 === 0) r -= outs[k] * 0.3;
      if (k % 4 === 1) l -= outs[k] * 0.3;
    }
    outL[i] = l * 0.5;
    outR[i] = r * 0.5;
  }
  return { L: outL, R: outR };
};

/* ------------------------------------------------------------------ */
/* Mastering: loudness (ITU-R BS.1770-4), limiting, fades, WAV output  */
/* ------------------------------------------------------------------ */

const biquad = (x, b, a) => {
  const y = new Float32Array(x.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = v;
    y[i] = v;
  }
  return y;
};

const integratedLoudness = (L, R) => {
  const shelf = [
    [1.53512485958697, -2.69169618940638, 1.19839281085285],
    [1, -1.69065929318241, 0.73248077421585],
  ];
  const hp = [
    [1, -2, 1],
    [1, -1.99004745483398, 0.99007225036621],
  ];
  const kL = biquad(biquad(L, ...shelf), ...hp);
  const kR = biquad(biquad(R, ...shelf), ...hp);
  const block = Math.round(0.4 * SR);
  const step = Math.round(0.1 * SR);
  const blocks = [];
  for (let s = 0; s + block <= kL.length; s += step) {
    let z = 0;
    for (let i = s; i < s + block; i++) z += kL[i] * kL[i] + kR[i] * kR[i];
    blocks.push(z / block);
  }
  const lufs = (z) => -0.691 + 10 * Math.log10(z);
  const abs = blocks.filter((z) => lufs(z) > -70);
  const meanAbs = abs.reduce((a, b) => a + b, 0) / abs.length;
  const rel = abs.filter((z) => lufs(z) > lufs(meanAbs) - 10);
  return lufs(rel.reduce((a, b) => a + b, 0) / rel.length);
};

/** 4x oversampled peak estimate (windowed-sinc interpolation). */
const truePeak = (x) => {
  const taps = 16;
  let peak = 0;
  for (let i = taps; i < x.length - taps; i++) {
    peak = Math.max(peak, Math.abs(x[i]));
    for (const frac of [0.25, 0.5, 0.75]) {
      let v = 0;
      for (let k = -taps + 1; k <= taps; k++) {
        const d = k - frac;
        const w = 0.5 + 0.5 * Math.cos((Math.PI * d) / taps);
        v += x[i + k] * (Math.sin(Math.PI * d) / (Math.PI * d)) * w;
      }
      peak = Math.max(peak, Math.abs(v));
    }
  }
  return peak;
};

const limit = (L, R, ceiling) => {
  const look = Math.round(0.003 * SR);
  const release = Math.exp(-1 / (0.08 * SR));
  const n = L.length;
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    need[i] = p > ceiling ? ceiling / p : 1;
  }
  const gain = new Float32Array(n);
  let g = 1;
  for (let i = 0; i < n; i++) {
    let target = 1;
    for (let k = i; k < Math.min(n, i + look); k++)
      target = Math.min(target, need[k]);
    g = target < g ? target : target + (g - target) * release;
    gain[i] = g;
  }
  for (let i = 0; i < n; i++) {
    L[i] *= gain[i];
    R[i] *= gain[i];
  }
};

const writeWav24 = (file, L, R) => {
  const n = L.length;
  const data = Buffer.alloc(n * 6);
  for (let i = 0; i < n; i++) {
    for (const [c, ch] of [
      [0, L],
      [1, R],
    ]) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      const s = Math.round(v * 8388607);
      data.writeIntLE(s, i * 6 + c * 3, 3);
    }
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 6, 28);
  header.writeUInt16LE(6, 32);
  header.writeUInt16LE(24, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
};

const master = (dry, reverbSend, reverbOpts, wet, file) => {
  const verb = fdnReverb(reverbSend, reverbOpts);
  const n = Math.round(DURATION * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  // Mix, then a gentle 35 Hz high-pass to remove DC and sub rumble.
  const hpA = Math.exp((-TAU * 35) / SR);
  let pxL = 0;
  let pxR = 0;
  let pyL = 0;
  let pyR = 0;
  for (let i = 0; i < n; i++) {
    const l = dry.L[i] + verb.L[i] * wet;
    const r = dry.R[i] + verb.R[i] * wet;
    pyL = hpA * (pyL + l - pxL);
    pyR = hpA * (pyR + r - pxR);
    pxL = l;
    pxR = r;
    L[i] = pyL;
    R[i] = pyR;
  }
  // Gentle presence shelf (+2 dB above ~2.5 kHz) for small phone speakers.
  const shelfA = Math.exp((-TAU * 2500) / SR);
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < n; i++) {
    lpL = (1 - shelfA) * L[i] + shelfA * lpL;
    lpR = (1 - shelfA) * R[i] + shelfA * lpR;
    L[i] += 0.26 * (L[i] - lpL);
    R[i] += 0.26 * (R[i] - lpR);
  }
  // Loudness normalisation, then true-peak safe limiting.
  const gain = dbToGain(TARGET_LUFS - integratedLoudness(L, R));
  for (let i = 0; i < n; i++) {
    L[i] *= gain;
    R[i] *= gain;
  }
  limit(L, R, dbToGain(CEILING_DBTP - 0.4));
  // Click-free edges: 4 ms fade-in, 0.45 s fade-out ending exactly at 15.000 s.
  const fin = Math.round(0.004 * SR);
  const fout = Math.round(0.45 * SR);
  for (let i = 0; i < fin; i++) {
    L[i] *= i / fin;
    R[i] *= i / fin;
  }
  for (let i = 0; i < fout; i++) {
    const g = Math.pow(1 - i / fout, 1.6);
    L[n - fout + i] *= g;
    R[n - fout + i] *= g;
  }
  const lufs = integratedLoudness(L, R);
  const tp = 20 * Math.log10(Math.max(truePeak(L), truePeak(R)));
  writeWav24(file, L, R);
  console.log(
    `${path.relative(ROOT, file)}  ${DURATION.toFixed(3)} s  ${lufs.toFixed(1)} LUFS  ${tp.toFixed(1)} dBTP`,
  );
};

/* ------------------------------------------------------------------ */
/* Score 01: "One Piece With a Past" (D major, rubato, film-score)     */
/* ------------------------------------------------------------------ */

const heritage = () => {
  const tl = readTimeline("heritage");
  const at = (key) => tl.cuts[key] / tl.fps;
  const rand = mulberry32(1973);
  const dry = new Bus();
  const send = new Bus();
  const padCh = channel(dry, send, 0.22);
  const pianoCh = channel(dry, send, 0.5);
  const fxCh = channel(dry, send, 0.6);

  const c = {
    detail1: at("detail1"),
    detail2: at("detail2"),
    detail3: at("detail3"),
    open: at("payoffOpen"),
    p2: at("payoff2"),
    p3: at("payoff3"),
    brand: at("brand"),
    logo: at("logo"),
  };

  // Harmony: D add9 -> Bm(add11) -> Gmaj7 -> Em9 -> Asus4 -> A -> D add9.
  // Levels trace the emotional arc: intimate hook, open payoff, warm resolve.
  const chords = [
    [0, c.detail1 + 0.15, ["D3", "A3", "E4", "F#4"], null, 0.34, 0.3],
    [c.detail1, c.open + 0.1, ["B2", "F#3", "D4", "E4"], null, 0.38, 1.0],
    [c.open, c.p2 + 0.8, ["G2", "D3", "B3", "F#4"], "G2", 0.5, 0.8],
    [c.p2 + 0.75, c.brand + 0.1, ["E3", "G3", "D4", "F#4"], "E2", 0.46, 1.0],
    [c.brand, c.brand + 1.35, ["A2", "E3", "A3", "D4"], "A2", 0.44, 1.0],
    [c.brand + 1.3, c.logo + 0.1, ["A2", "E3", "A3", "C#4"], "A2", 0.46, 0.9],
    [c.logo, DURATION, ["D3", "A3", "E4", "F#4", "A4"], "D2", 0.55, 0.6],
  ];
  chords.forEach(([t0, t1, notes, root, level, attack]) => {
    pad(padCh, rand, t0, t1, notes, level, { attack, release: 1.3 });
    if (root) sub(dry, t0, t1, root, 0.022);
  });

  // Felt-piano melody, phrased against the picture.
  const melody = [
    [0.03, ["F#5", "D4"], 0.6],
    [0.7, ["E5"], 0.46],
    [1.4, ["D5"], 0.52],
    [2.1, ["A4"], 0.44],
    [c.detail1, ["D5", "B4"], 0.54],
    [c.detail1 + 0.56, ["F#5"], 0.4],
    [c.detail2, ["E5"], 0.5],
    [c.detail2 + 0.5, ["D5"], 0.38],
    [c.detail3, ["C#5", "F#4"], 0.48],
    [c.open, ["G4", "B4", "D5"], 0.62],
    [c.open + 0.72, ["F#5"], 0.42],
    [c.p2, ["A5"], 0.5],
    [c.p2 + 0.85, ["G5"], 0.42],
    [c.p3, ["F#5"], 0.5],
    [c.p3 + 0.8, ["E5"], 0.38],
    [c.brand, ["E5", "A4"], 0.52],
    [c.brand + 0.7, ["D5"], 0.42],
    [c.brand + 1.35, ["C#5"], 0.46],
    [c.brand + 1.95, ["E5"], 0.36],
    [c.logo, ["D5", "F#5", "A5"], 0.6],
    [c.logo + 0.75, ["A5"], 0.3],
  ];
  melody.forEach(([t, notes, vel]) =>
    notes.forEach((n, k) =>
      feltPiano(
        pianoCh,
        rand,
        t + k * 0.012,
        n,
        vel * 1.25,
        1.6,
        0.18 - k * 0.12,
      ),
    ),
  );

  // Sound design, synced to the picture.
  whoosh(fxCh, rand, c.detail1 - 0.22, 0.42, 0.05, 900, 2600, -0.4, 0.3);
  glassTing(fxCh, rand, c.detail2 + 0.02, 0.05);
  whoosh(fxCh, rand, c.open - 0.34, 0.7, 0.07, 400, 2200, 0.5, -0.4);
  lowBoom(dry, rand, c.open, 0.08);
  whoosh(fxCh, rand, c.brand - 0.3, 0.55, 0.05, 2400, 700, -0.3, 0.4);
  whoosh(fxCh, rand, c.logo - 0.4, 0.5, 0.045, 700, 2600, 0.3, -0.3);
  bell(fxCh, rand, c.logo + 0.02, "D6", 0.05, 0.1);
  bell(fxCh, rand, c.logo + 0.42, "A5", 0.028, -0.2);

  master(
    dry,
    send,
    { t60: 2.6, damping: 0.42, predelay: 0.025, size: 1.1 },
    1.0,
    path.join(ROOT, "assets", "audio", "heritage-score.wav"),
  );
};

/* ------------------------------------------------------------------ */
/* Score 02: "Not Your Ordinary Decor" (A minor -> C, 120 BPM groove)  */
/* ------------------------------------------------------------------ */

const product = () => {
  const tl = readTimeline("product");
  const fps = tl.fps;
  const rand = mulberry32(2026);
  const dry = new Bus();
  const send = new Bus();
  const both = (fn) => {
    fn(dry);
    fn(send);
  };
  const beat = 60 / tl.bpm;
  const cta = tl.cuts.cta / fps;

  // Harmony per two-second bar: Am | F | C | G | Am | F | G(half) -> C.
  const bars = [
    ["A", ["A3", "C4", "E4"], "A2"],
    ["F", ["F3", "A3", "C4"], "F2"],
    ["C", ["C3", "E3", "G3"], "C3"],
    ["G", ["G3", "B3", "D4"], "G2"],
    ["Am", ["A3", "C4", "E4"], "A2"],
    ["F", ["F3", "A3", "C4"], "F2"],
    ["G", ["G3", "B3", "D4"], "G2"],
  ];
  const arps = {
    A: ["A4", "C5", "E5", "A5", "E5", "C5", "B4", "C5"],
    Am: ["A4", "C5", "E5", "A5", "B5", "A5", "E5", "C5"],
    F: ["F4", "A4", "C5", "F5", "C5", "A4", "G4", "A4"],
    C: ["C5", "E5", "G5", "C6", "G5", "E5", "D5", "E5"],
    G: ["G4", "B4", "D5", "G5", "D5", "B4", "A4", "B4"],
  };

  for (let bar = 0; bar < 7; bar++) {
    const t0 = bar * 4 * beat;
    const [name, chord, root] = bars[bar];
    const barEnd = Math.min(t0 + 4 * beat, cta);
    if (t0 >= cta) break;
    // Light pad from the second bar.
    if (bar >= 1) {
      both((b) =>
        pad(b, rand, t0, barEnd, chord, 0.32, {
          attack: 0.25,
          release: 0.5,
          tilt: 4,
        }),
      );
    }
    for (let s = 0; s < 16; s++) {
      const t = t0 + s * (beat / 4);
      if (t >= cta - 0.01) break;
      const note = arps[name][s % 8];
      const accent = s % 4 === 0 ? 1 : 0.62;
      const vel = bar === 0 ? 0.1 + 0.06 * (s / 16) : 0.14;
      both((b) =>
        marimba(b, rand, t, note, vel * accent, s % 2 ? 0.35 : -0.35),
      );
      if (s % 2 === 0) hat(dry, rand, t + 0.004, s % 4 === 2 ? 0.09 : 0.055);
    }
    for (let q = 0; q < 4; q++) {
      const t = t0 + q * beat;
      if (t >= cta - 0.01) break;
      if (q % 2 === 0) kick(dry, rand, t, bar === 0 && q === 2 ? 0.34 : 0.44);
      else if (bar >= 1) both((b) => snap(b, rand, t, 0.16));
      if (bar >= 1) {
        bass(dry, t, root, beat * 0.7, 0.13);
        bass(dry, t + beat * 0.75, root, beat * 0.2, 0.08);
      }
    }
  }

  // Hook flip-book ticks and the hero landing.
  tl.flips.forEach((f, k) => {
    if (k > 0) both((b) => hat(b, rand, f / fps, 0.07, k % 2 ? 0.3 : -0.3));
  });
  both((b) => whoosh(b, rand, tl.cuts.hero / fps - 0.25, 0.4, 0.06, 700, 3000));

  // Price tags are "typed" onto each product.
  tl.tags.forEach((f) => both((b) => typeClick(b, rand, f / fps, 0.32)));

  // Detail transitions and the collection mosaic.
  tl.cuts.desire.forEach((f) =>
    both((b) => whoosh(b, rand, f / fps - 0.2, 0.35, 0.045, 1200, 3200)),
  );
  tl.tiles.forEach((f, k) =>
    both((b) =>
      marimba(
        b,
        rand,
        f / fps,
        ["E5", "G5", "A5", "C6", "E6", "D6", "C6", "A5", "G5"][k % 9],
        0.06,
        ((k % 3) - 1) * 0.4,
      ),
    ),
  );
  riser(dry, rand, cta - 1.1, 1.1, 0.06);

  // Call to action: resolve to C major with a bell.
  lowBoom(dry, rand, cta, 0.09);
  kick(dry, rand, cta, 0.4);
  both((b) =>
    pad(b, rand, cta, DURATION, ["C3", "G3", "C4", "E4"], 0.7, {
      attack: 0.05,
      release: 1.6,
      tilt: 5,
    }),
  );
  sub(dry, cta, DURATION, "C2", 0.03);
  ["C5", "E5", "G5"].forEach((n, k) =>
    both((b) => marimba(b, rand, cta + k * 0.018, n, 0.13, (k - 1) * 0.3)),
  );
  both((b) => bell(b, rand, cta + 0.01, "C6", 0.055, 0.1));
  both((b) => bell(b, rand, cta + 0.5, "G5", 0.03, -0.2));
  [0.75, 1.0, 1.25, 1.5].forEach((d, k) =>
    both((b) =>
      marimba(
        b,
        rand,
        cta + d,
        ["G5", "E5", "C5", "G4"][k],
        0.07 - k * 0.012,
        k % 2 ? 0.3 : -0.3,
      ),
    ),
  );

  master(
    dry,
    send,
    { t60: 1.3, damping: 0.5, predelay: 0.012, size: 0.75 },
    0.32,
    path.join(ROOT, "assets", "audio", "product-score.wav"),
  );
};

/* ------------------------------------------------------------------ */
/* Black Friday instruments                                            */
/* ------------------------------------------------------------------ */

/** Darbuka "dum" (deep centre stroke) and "tek" (rim crack), synthesised. */
const darbuka = (bus, rand, t, stroke, level, pan = 0) => {
  const i0 = Math.round(t * SR);
  const [gl, gr] = panGains(pan);
  if (stroke === "dum") {
    let phase = 0;
    const svf = new SVF();
    for (let i = 0; i < SR * 0.45; i++) {
      const tt = i / SR;
      const f = 92 + 70 * Math.exp(-tt / 0.03);
      phase += (TAU * f) / SR;
      const body = Math.sin(phase) * Math.exp(-tt / 0.16);
      const skin =
        svf.process(rand() * 2 - 1, 420, 1).low * Math.exp(-tt / 0.02) * 0.5;
      const v = (body + skin) * level * (1 - Math.exp(-tt / 0.0015));
      bus.add(i0 + i, v * gl, v * gr);
    }
  } else {
    const svf = new SVF();
    for (let i = 0; i < SR * 0.12; i++) {
      const tt = i / SR;
      const crack =
        svf.process(rand() * 2 - 1, 3400, 0.5).band * Math.exp(-tt / 0.012);
      const ring = Math.sin(TAU * 1180 * tt) * 0.25 * Math.exp(-tt / 0.03);
      const v = (crack + ring) * level * (stroke === "ka" ? 0.45 : 1);
      bus.add(i0 + i, v * gl, v * gr);
    }
  }
};

/** Short, bowed-string pulse (an eighth-note ostinato voice). */
const stringPulse = (bus, rand, t, notes, seconds, level) => {
  for (const name of notes) {
    const f0 = freq(name);
    const parts = Math.min(14, Math.floor(7000 / f0));
    for (const [cents, pan] of [
      [-5, -0.4],
      [5, 0.4],
    ]) {
      const fv = f0 * Math.pow(2, cents / 1200);
      const env = (tt) => {
        const a = Math.min(1, tt / 0.03);
        const r = tt < seconds ? 1 : Math.max(0, 1 - (tt - seconds) / 0.12);
        return a * r * Math.exp(-tt / (seconds * 1.4));
      };
      for (let n = 1; n <= parts; n++) {
        const amp =
          (level / notes.length) * (1 / n) * Math.exp(-(n - 1) / 3.2) * 0.4;
        partial(bus, t, seconds + 0.14, fv * n, amp, env, pan, rand() * TAU);
      }
    }
  }
};

/* ------------------------------------------------------------------ */
/* Black Friday 01: "The Ladder" (A harmonic minor, 120 BPM, darbuka)  */
/* ------------------------------------------------------------------ */

const bfLadder = () => {
  const tl = readTimeline("bf-ladder");
  const fps = tl.fps;
  const beat = 60 / tl.bpm;
  const rand = mulberry32(1106);
  const dry = new Bus();
  const send = new Bus();
  const keys = channel(dry, send, 0.3);
  const drums = channel(dry, send, 0.12);
  const fx = channel(dry, send, 0.45);
  const cta = tl.cuts.cta / fps;
  const tiers = tl.cuts.tiers.map((f) => f / fps);

  // Harmony per two-second bar: Am | F | E | Am | F | E -> A major resolution.
  const bars = [
    [["A3", "C4", "E4"], "A2"],
    [["F3", "A3", "C4"], "F2"],
    [["E3", "G#3", "B3"], "E2"],
    [["A3", "C4", "E4"], "A2"],
    [["F3", "A3", "C4"], "F2"],
    [["E3", "G#3", "B3"], "E2"],
  ];
  const motif = {
    A2: ["A4", "C5", "E5", "A5", "G#5", "E5", "C5", "B4"],
    F2: ["F4", "A4", "C5", "F5", "E5", "C5", "A4", "G#4"],
    E2: ["E4", "G#4", "B4", "E5", "D5", "B4", "G#4", "F4"],
  };
  // Maqsum: dum tek . tek dum . tek .  (eighth notes), with ghost "ka" strokes.
  const maqsum = ["dum", "tek", null, "tek", "dum", null, "tek", null];

  for (let bar = 0; bar < 6; bar++) {
    const t0 = bar * 4 * beat;
    if (t0 >= cta) break;
    const [chord, root] = bars[bar];
    const barEnd = Math.min(t0 + 4 * beat, cta);
    pad(keys, rand, t0, barEnd, chord, bar === 0 ? 0.22 : 0.3, {
      attack: 0.08,
      release: 0.4,
      tilt: 4,
    });
    for (let e = 0; e < 8; e++) {
      const t = t0 + e * (beat / 2);
      if (t >= cta - 0.01) break;
      const stroke = maqsum[e];
      if (stroke)
        darbuka(
          drums,
          rand,
          t,
          stroke,
          stroke === "dum" ? 0.5 : 0.22,
          stroke === "dum" ? 0 : 0.25,
        );
      else darbuka(drums, rand, t, "ka", 0.18, -0.25);
      marimba(
        keys,
        rand,
        t,
        motif[root][e],
        e % 4 === 0 ? 0.14 : 0.09,
        e % 2 ? 0.3 : -0.3,
      );
      if (e % 2 === 0) bass(dry, t, root, beat * 0.42, e === 0 ? 0.15 : 0.1);
    }
  }

  // Opening stinger on frame 1: the "40%" punch.
  lowBoom(dry, rand, 0.01, 0.12);
  kick(dry, rand, 0.01, 0.42);
  bell(fx, rand, 0.03, "A5", 0.035, 0.1);

  // Ladder: each tier hits harder and higher; 40% is the peak.
  tiers.forEach((t, k) => {
    riser(dry, rand, t - 0.45, 0.45, 0.025 + k * 0.012);
    kick(dry, rand, t, 0.36 + k * 0.06);
    ["A4", "C#5", "E5"]
      .slice(0, k + 1)
      .forEach((n, j) =>
        marimba(keys, rand, t + j * 0.02, n, 0.12 + k * 0.03, (j - 1) * 0.3),
      );
    if (k === 2) {
      lowBoom(dry, rand, t, 0.11);
      bell(fx, rand, t + 0.01, "E6", 0.04, -0.1);
    }
  });

  // Price cards slide in; tags are typed onto each piece.
  tl.cuts.prices.forEach((f) =>
    whoosh(fx, rand, f / fps - 0.2, 0.36, 0.045, 1200, 3200),
  );
  tl.tags.forEach((f) => typeClick(fx, rand, f / fps, 0.3));

  // Call to action: resolve to A major with a bell.
  riser(dry, rand, cta - 0.9, 0.9, 0.05);
  lowBoom(dry, rand, cta, 0.12);
  kick(dry, rand, cta, 0.4);
  pad(keys, rand, cta, DURATION, ["A3", "C#4", "E4", "A4"], 0.6, {
    attack: 0.05,
    release: 1.6,
    tilt: 5,
  });
  sub(dry, cta, DURATION, "A1", 0.03);
  ["A4", "C#5", "E5"].forEach((n, k) =>
    marimba(keys, rand, cta + k * 0.02, n, 0.14, (k - 1) * 0.3),
  );
  bell(fx, rand, cta + 0.01, "A5", 0.05, 0.1);
  bell(fx, rand, cta + 0.5, "E6", 0.03, -0.2);
  [0.75, 1.0, 1.25, 1.5].forEach((d, k) =>
    marimba(
      keys,
      rand,
      cta + d,
      ["E5", "C#5", "A4", "E4"][k],
      0.07 - k * 0.012,
      k % 2 ? 0.3 : -0.3,
    ),
  );

  master(
    dry,
    send,
    { t60: 1.2, damping: 0.5, predelay: 0.012, size: 0.75 },
    0.35,
    path.join(ROOT, "assets", "audio", "bf-ladder-score.wav"),
  );
};

/* ------------------------------------------------------------------ */
/* Black Friday 02: "The 40% Set" (D minor -> D major, 80 BPM)         */
/* ------------------------------------------------------------------ */

const bfSet = () => {
  const tl = readTimeline("bf-set");
  const fps = tl.fps;
  const beat = 60 / tl.bpm;
  const rand = mulberry32(1311);
  const dry = new Bus();
  const send = new Bus();
  const padCh = channel(dry, send, 0.25);
  const pianoCh = channel(dry, send, 0.5);
  const fx = channel(dry, send, 0.55);
  const p = tl.cuts.pieces.map((f) => f / fps);
  const math = tl.cuts.math / fps;
  const stamp = tl.cuts.stamp / fps;
  const cta = tl.cuts.cta / fps;

  // Harmony: Dm(add9) hook | Dm | Bbmaj7 | Gm7 | A (dominant) | riser | D major.
  const chords = [
    [0, p[0], ["D3", "A3", "E4", "F4"], 0.34],
    [p[0], p[1], ["D3", "A3", "D4", "F4"], 0.38],
    [p[1], p[2], ["Bb2", "F3", "A3", "D4"], 0.42],
    [p[2], p[3], ["G2", "D3", "F3", "Bb3"], 0.46],
    [p[3], stamp, ["A2", "E3", "A3", "C#4"], 0.5],
    [stamp, DURATION, ["D3", "A3", "D4", "F#4", "A4"], 0.58],
  ];
  chords.forEach(([t0, t1, notes, level]) =>
    pad(padCh, rand, t0, t1, notes, level, { attack: 0.3, release: 1.2 }),
  );
  [
    ["D2", 0, p[1]],
    ["Bb1", p[1], p[2]],
    ["G1", p[2], p[3]],
    ["A1", p[3], stamp],
    ["D2", stamp, DURATION],
  ].forEach(([n, t0, t1]) => sub(dry, t0, t1, n, 0.022));

  // Opening: a bold low chord on frame 1.
  lowBoom(dry, rand, 0.01, 0.1);
  ["D4", "A4", "D5", "F5"].forEach((n, k) =>
    feltPiano(pianoCh, rand, 0.02 + k * 0.012, n, 0.62, 2.2, (k - 1.5) * 0.15),
  );

  // Each piece: a piano voicing on the cut and a soft air movement.
  const pieceNotes = [
    ["F5", "A5"],
    ["D5", "F5"],
    ["D5", "G5"],
    ["E5", "A5"],
  ];
  p.forEach((t, k) => {
    whoosh(
      fx,
      rand,
      t - 0.25,
      0.4,
      0.04,
      700,
      2600,
      k % 2 ? 0.4 : -0.4,
      k % 2 ? -0.4 : 0.4,
    );
    pieceNotes[k].forEach((n, j) =>
      feltPiano(
        pianoCh,
        rand,
        t + j * 0.015,
        n,
        0.5 + k * 0.03,
        1.4,
        0.15 - j * 0.3,
      ),
    );
  });

  // Momentum: an eighth-note string ostinato and soft kicks that build to the saving.
  const ostinato = [
    [p[0], p[1], ["D3", "A3"]],
    [p[1], p[2], ["Bb2", "F3"]],
    [p[2], p[3], ["G2", "D3"]],
    [p[3], stamp, ["A2", "E3"]],
  ];
  ostinato.forEach(([t0, t1, notes], k) => {
    for (let t = t0; t < t1 - 0.01; t += beat / 2) {
      stringPulse(padCh, rand, t, notes, beat * 0.32, 0.16 + k * 0.03);
    }
  });
  for (let t = p[1]; t < stamp - 0.01; t += beat)
    kick(dry, rand, t, 0.26 + (t - p[1]) * 0.02);

  // Receipt rows are typed; the saving lands with a resolution.
  tl.cuts.rows.forEach((f) => typeClick(fx, rand, f / fps, 0.3));
  riser(dry, rand, stamp - 1.0, 1.0, 0.05);
  lowBoom(dry, rand, stamp, 0.13);
  kick(dry, rand, stamp, 0.42);
  ["D4", "F#4", "A4", "D5"].forEach((n, k) =>
    feltPiano(pianoCh, rand, stamp + k * 0.012, n, 0.62, 2.0, (k - 1.5) * 0.15),
  );
  bell(fx, rand, stamp + 0.01, "D6", 0.05, 0.1);
  bell(fx, rand, stamp + 0.45, "A5", 0.03, -0.2);

  // Call to action: gentle continuation in D major.
  whoosh(fx, rand, cta - 0.35, 0.5, 0.04, 2400, 700);
  [
    ["A5", 0],
    ["F#5", 0.75],
    ["D5", 1.5],
  ].forEach(([n, d]) => feltPiano(pianoCh, rand, cta + d, n, 0.36, 1.2, 0.1));

  master(
    dry,
    send,
    { t60: 2.2, damping: 0.42, predelay: 0.02, size: 1.0 },
    1.0,
    path.join(ROOT, "assets", "audio", "bf-set-score.wav"),
  );
};

/* ------------------------------------------------------------------ */

const which = process.argv[2] ?? "all";
fs.mkdirSync(path.join(ROOT, "assets", "audio"), { recursive: true });
if (which === "heritage" || which === "all") heritage();
if (which === "product" || which === "all") product();
if (which === "bf-ladder" || which === "all") bfLadder();
if (which === "bf-set" || which === "all") bfSet();
