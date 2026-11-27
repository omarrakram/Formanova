#!/usr/bin/env node
/**
 * Validates every campaign under Content/Ads against its deliverables.json:
 *
 *   - each final video exists and matches its declared technical spec
 *     (codec, pixel format, colour tags, resolution, frame rate, exact frame
 *     count, exact duration of container, video and audio, audio format, size);
 *   - every required companion file exists and is not empty;
 *   - every file listed in asset-manifest.csv exists with the recorded SHA-256.
 *
 * Requires ffprobe on PATH. No npm dependencies.
 *
 *   node .github/scripts/validate-content.mjs
 */

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const ADS = path.join(REPO, "Content", "Ads");
const DURATION_TOLERANCE = 0.0005;

let failures = 0;
const pass = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`  FAIL  ${msg}`);
};
const check = (condition, msg) => (condition ? pass(msg) : fail(msg));

const ffprobe = (args) =>
  JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-of", "json", ...args], {
      encoding: "utf8",
    }),
  );

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) rows.push([...row, field]);
  const [header, ...body] = rows;
  return body.map((r) =>
    Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])),
  );
};

const validateVideo = (campaignDir, deliverable) => {
  const file = path.join(campaignDir, deliverable.file);
  const spec = deliverable.spec;
  console.log(`\n${deliverable.id}: ${deliverable.file}`);
  if (!fs.existsSync(file)) return fail("file exists");
  pass("file exists");

  const sizeMB = fs.statSync(file).size / 1e6;
  check(
    sizeMB <= spec.maxSizeMB,
    `size ${sizeMB.toFixed(2)} MB <= ${spec.maxSizeMB} MB`,
  );

  const probe = ffprobe(["-show_format", "-show_streams", file]);
  const video = probe.streams.find((s) => s.codec_type === "video");
  const audio = probe.streams.find((s) => s.codec_type === "audio");
  check(
    probe.format.format_name.includes(spec.container),
    `container ${probe.format.format_name}`,
  );
  if (!video) return fail("video stream present");

  check(
    video.codec_name === spec.videoCodec,
    `video codec ${video.codec_name}`,
  );
  check(video.pix_fmt === spec.pixelFormat, `pixel format ${video.pix_fmt}`);
  check(
    video.color_space === spec.colorSpace &&
      video.color_primaries === spec.colorSpace &&
      video.color_transfer === spec.colorSpace,
    `colour tags ${video.color_space}/${video.color_primaries}/${video.color_transfer}`,
  );
  check(
    video.width === spec.width && video.height === spec.height,
    `resolution ${video.width}x${video.height}`,
  );
  check(
    video.r_frame_rate === spec.frameRate,
    `frame rate ${video.r_frame_rate}`,
  );

  const counted = ffprobe([
    "-count_frames",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=nb_read_frames",
    file,
  ]);
  const frames = Number(counted.streams[0].nb_read_frames);
  check(frames === spec.frames, `decoded frames ${frames}`);

  const durations = {
    container: Number(probe.format.duration),
    video: Number(video.duration),
    audio: audio ? Number(audio.duration) : NaN,
  };
  for (const [name, value] of Object.entries(durations)) {
    check(
      Math.abs(value - spec.durationSeconds) <= DURATION_TOLERANCE,
      `${name} duration ${value.toFixed(6)} s`,
    );
  }

  if (!audio) return fail("audio stream present");
  check(
    audio.codec_name === spec.audioCodec,
    `audio codec ${audio.codec_name} ${audio.profile ?? ""}`.trim(),
  );
  check(
    Number(audio.sample_rate) === spec.audioSampleRate,
    `audio sample rate ${audio.sample_rate} Hz`,
  );
  check(
    audio.channels === spec.audioChannels,
    `audio channels ${audio.channels}`,
  );
};

const validateManifest = (campaignDir) => {
  const manifest = path.join(campaignDir, "asset-manifest.csv");
  if (!fs.existsSync(manifest)) return;
  console.log("\nasset-manifest.csv");
  const rows = parseCsv(fs.readFileSync(manifest, "utf8"));
  let ok = 0;
  for (const row of rows) {
    const file = path.join(REPO, row.local_path);
    if (!fs.existsSync(file)) {
      fail(`${row.asset_id}: missing ${row.local_path}`);
      continue;
    }
    const digest = crypto
      .createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex");
    if (digest !== row.sha256) fail(`${row.asset_id}: checksum mismatch`);
    else ok++;
  }
  check(
    ok === rows.length,
    `${ok}/${rows.length} assets present with matching SHA-256`,
  );
};

const campaigns = fs.existsSync(ADS)
  ? fs
      .readdirSync(ADS)
      .filter((d) => fs.existsSync(path.join(ADS, d, "deliverables.json")))
  : [];

if (campaigns.length === 0) {
  console.log("No campaigns with a deliverables.json found under Content/Ads.");
}

for (const campaign of campaigns.sort()) {
  const dir = path.join(ADS, campaign);
  const declared = JSON.parse(
    fs.readFileSync(path.join(dir, "deliverables.json"), "utf8"),
  );
  console.log(`\n=== Content/Ads/${campaign}`);
  console.log("\nrequired files");
  for (const required of declared.requiredFiles ?? []) {
    const file = path.join(dir, required);
    check(fs.existsSync(file) && fs.statSync(file).size > 0, required);
  }
  for (const deliverable of declared.deliverables)
    validateVideo(dir, deliverable);
  validateManifest(dir);
}

console.log(
  failures === 0
    ? "\nAll content checks passed."
    : `\n${failures} check(s) failed.`,
);
process.exitCode = failures === 0 ? 0 : 1;
