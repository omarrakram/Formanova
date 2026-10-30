import React from "react";
import { Img, staticFile } from "remotion";

type PhotoProps = {
  /** Path inside assets/, e.g. "products/<handle>/<file>.jpg". */
  src: string;
  /** Focal point in percent; used for cropping and as the zoom origin. */
  focus?: [number, number];
  /** Scale at motion progress 0 and 1. */
  scale?: [number, number];
  /** Translation in px at motion progress 0 and 1. */
  shift?: [[number, number], [number, number]];
  /** Motion progress 0..1, computed by the scene from the current frame. */
  t: number;
  /**
   * Optional layout box in frame pixels. Without it the photograph is
   * cover-fitted to the whole 1080x1920 frame.
   */
  box?: { x: number; y: number; w: number; h: number };
  style?: React.CSSProperties;
};

/**
 * Authentic product photograph with a slow, art-directed camera move.
 * The photograph itself is never retouched or recoloured; only framing,
 * scale and position change over time.
 */
export const Photo: React.FC<PhotoProps> = ({
  src,
  focus = [50, 50],
  scale = [1, 1.06],
  shift = [
    [0, 0],
    [0, 0],
  ],
  t,
  box,
  style,
}) => {
  const s = scale[0] + (scale[1] - scale[0]) * t;
  const x = shift[0][0] + (shift[1][0] - shift[0][0]) * t;
  const y = shift[0][1] + (shift[1][1] - shift[0][1]) * t;
  const layout: React.CSSProperties = box
    ? { left: box.x, top: box.y, width: box.w, height: box.h }
    : { inset: 0 };

  return (
    <div
      style={{
        position: "absolute",
        ...layout,
        overflow: "hidden",
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${focus[0]}% ${focus[1]}%`,
          transformOrigin: `${focus[0]}% ${focus[1]}%`,
          scale: String(s),
          translate: `${x}px ${y}px`,
        }}
      />
    </div>
  );
};
