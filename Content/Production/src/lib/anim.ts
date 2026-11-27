import { Easing, interpolate } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Smooth editorial ease (fast start, long settle). */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Symmetric ease for camera moves and cross-fades. */
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
/** Gentle ease-in for exits. */
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

/** Clamped 0..1 progress of `frame` between `start` and `end`. */
export const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
): number => interpolate(frame, [start, end], [0, 1], { ...CLAMP, easing });

/** Clamped interpolation shorthand. */
export const lerpFrames = (
  frame: number,
  input: number[],
  output: number[],
  easing?: (t: number) => number,
): number => interpolate(frame, input, output, { ...CLAMP, easing });

/**
 * Opacity envelope: fades in over `fadeIn` frames from `start`, holds, then
 * fades out over `fadeOut` frames ending at `end`.
 */
export const fadeWindow = (
  frame: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
): number => {
  if (frame < start || frame > end) return 0;
  const a = fadeIn > 0 ? progress(frame, start, start + fadeIn, EASE_OUT) : 1;
  const b =
    fadeOut > 0 ? 1 - progress(frame, end - fadeOut, end, EASE_IN_OUT) : 1;
  return Math.min(a, b);
};

/** Deterministic pseudo-random number in [0, 1) for a given integer seed. */
export const seeded = (seed: number): number => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
