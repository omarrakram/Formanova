import React from "react";
import { Composition, Folder } from "remotion";
import "./brand/fonts";
import { VIDEO } from "./brand/tokens";
import { Heritage } from "./creatives/heritage/Heritage";
import { ProductAd } from "./creatives/product/ProductAd";

/**
 * Formanova video compositions. Every ad is 1080x1920, 30 fps, 450 frames
 * (exactly 15.000 s), matching the declared deliverable specification.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Sales-Launch-2026-10">
      <Composition
        id="Heritage"
        component={Heritage}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={VIDEO.durationInFrames}
        defaultProps={{ audio: true, showSafeZones: false }}
      />
      <Composition
        id="ProductAd"
        component={ProductAd}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={VIDEO.durationInFrames}
        defaultProps={{ audio: true, showSafeZones: false }}
      />
    </Folder>
  );
};
