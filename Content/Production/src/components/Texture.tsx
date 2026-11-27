import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { seeded } from "../lib/anim";

const grainTile = (seed: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

const TILES = [grainTile(3), grainTile(11), grainTile(23)];

/**
 * Subtle photographic grain. Deterministic: the tile and offset are derived
 * from the frame number, so every render is identical.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const tile = TILES[frame % TILES.length];
  const ox = Math.round(seeded(frame * 2 + 1) * 360);
  const oy = Math.round(seeded(frame * 2 + 2) * 360);

  return (
    <AbsoluteFill
      style={{
        backgroundImage: tile,
        backgroundPosition: `${ox}px ${oy}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

/** Soft lens vignette that keeps the eye on the centre of the frame. */
export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.5,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 70% at 50% 46%, rgba(10,6,3,0) 55%, rgba(10,6,3,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Vertical scrim used behind copy that sits on top of photography. */
export const Scrim: React.FC<{
  from: "top" | "bottom";
  height: number;
  opacity: number;
}> = ({ from, height, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      height,
      [from]: 0,
      background: `linear-gradient(to ${from === "top" ? "bottom" : "top"}, rgba(14,9,5,${opacity}) 0%, rgba(14,9,5,${opacity * 0.6}) 45%, rgba(14,9,5,0) 100%)`,
      pointerEvents: "none",
    }}
  />
);
