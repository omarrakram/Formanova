import React from "react";

/** A round-topped arch, the recurring heritage-architecture motif. */
export type ArchBox = { x: number; y: number; w: number; h: number };

export const FULL_FRAME: ArchBox = { x: 0, y: 0, w: 1080, h: 1920 };

/** Interpolates between two arch boxes. Radius follows the box width. */
export const mixArch = (a: ArchBox, b: ArchBox, t: number): ArchBox => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

/**
 * CSS clip-path for an arch inside a 1080x1920 frame. `roundness` blends
 * from a plain rectangle (0) to a full semicircular head (1).
 */
export const archClip = (box: ArchBox, roundness = 1): string => {
  const top = box.y;
  const left = box.x;
  const right = 1080 - (box.x + box.w);
  const bottom = 1920 - (box.y + box.h);
  const r = (box.w / 2) * roundness;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px ${r}px 0px 0px)`;
};

/** Thin gold outline that sits just outside an arch, like a gallery niche. */
export const ArchOutline: React.FC<{
  box: ArchBox;
  offset?: number;
  color: string;
  opacity: number;
  /** 0..1 draw-on progress. */
  draw?: number;
  strokeWidth?: number;
}> = ({ box, offset = 16, color, opacity, draw = 1, strokeWidth = 2 }) => {
  const x = box.x - offset;
  const y = box.y - offset;
  const w = box.w + offset * 2;
  const h = box.h + offset * 2;
  const r = w / 2;
  const d = `M ${x} ${y + h} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h}`;
  const length = 2 * (h - r) + Math.PI * r;

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - draw)}
      />
    </svg>
  );
};
