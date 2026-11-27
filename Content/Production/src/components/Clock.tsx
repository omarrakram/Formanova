import React from "react";
import { COLORS } from "../brand/tokens";

/**
 * A gold clock face. The hands show hours:minutes:seconds; `seconds` may be
 * fractional so the second hand can tick on the beat.
 */
export const Clock: React.FC<{
  size: number;
  hours: number;
  minutes: number;
  seconds: number;
  glow?: number;
}> = ({ size, hours, minutes, seconds, glow = 0 }) => {
  const r = size / 2;
  const minute = minutes + seconds / 60;
  const hand = (
    angle: number,
    length: number,
    width: number,
    color: string,
  ) => (
    <line
      x1={r}
      y1={r + length * 0.16}
      x2={r}
      y2={r - length}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${angle} ${r} ${r})`}
    />
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${18 + 30 * glow}px rgba(239,206,108,${0.22 + 0.3 * glow}))`,
      }}
    >
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.02}
        fill="rgba(26,17,11,0.9)"
        stroke={COLORS.gold}
        strokeWidth={size * 0.018}
      />
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.06}
        fill="none"
        stroke="rgba(239,206,108,0.35)"
        strokeWidth={size * 0.004}
      />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = r - size * 0.09;
        const r2 = r - size * (i % 15 === 0 ? 0.2 : major ? 0.16 : 0.115);
        return (
          <line
            key={i}
            x1={r + r1 * Math.sin(a)}
            y1={r - r1 * Math.cos(a)}
            x2={r + r2 * Math.sin(a)}
            y2={r - r2 * Math.cos(a)}
            stroke={COLORS.gold}
            strokeWidth={size * (i % 15 === 0 ? 0.024 : major ? 0.014 : 0.006)}
            strokeLinecap="round"
            opacity={major ? 1 : 0.6}
          />
        );
      })}
      {hand(
        (((hours % 12) + minute / 60) / 12) * 360,
        r * 0.5,
        size * 0.034,
        COLORS.gold,
      )}
      {hand(minute * 6, r * 0.74, size * 0.022, COLORS.goldSoft)}
      {hand(seconds * 6, r * 0.8, size * 0.009, "#D9573A")}
      <circle cx={r} cy={r} r={size * 0.035} fill={COLORS.gold} />
      <circle cx={r} cy={r} r={size * 0.014} fill="#D9573A" />
    </svg>
  );
};

/** Seconds shown at `frame`: one mechanical tick per beat (15 frames at 120 BPM). */
export const tickSeconds = (frame: number, start: number, beatFrames = 15) => {
  const beats = frame / beatFrames;
  const whole = Math.floor(beats);
  const snap = Math.min(1, ((beats - whole) * beatFrames) / 3);
  return start + whole + snap;
};
