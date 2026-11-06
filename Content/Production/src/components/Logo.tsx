import React from "react";
import { Img, staticFile } from "remotion";
import { LOGO_BOX } from "../brand/tokens";

/**
 * The original gold "FormaNova" script wordmark, cropped to its glyph box
 * with CSS so the source PNG stays untouched.
 */
export const Logo: React.FC<{
  width: number;
  /** 0..1 left-to-right reveal, like ink being drawn. */
  reveal?: number;
  style?: React.CSSProperties;
}> = ({ width, reveal = 1, style }) => {
  const s = width / LOGO_BOX.width;
  const height = LOGO_BOX.height * s;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        clipPath: `inset(-10% ${(1 - reveal) * 100}% -10% 0%)`,
        ...style,
      }}
    >
      <Img
        src={staticFile("brand/formanova-logo-gold.png")}
        style={{
          position: "absolute",
          width: LOGO_BOX.canvas * s,
          height: LOGO_BOX.canvas * s,
          left: -LOGO_BOX.x * s,
          top: -LOGO_BOX.y * s,
          maxWidth: "none",
        }}
      />
    </div>
  );
};
