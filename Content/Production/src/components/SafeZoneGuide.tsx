import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE } from "../brand/tokens";

/**
 * QA overlay showing where the Reels interface covers the frame.
 * Enabled with the `showSafeZones` prop; never part of a final export.
 */
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: SAFE.top,
        background: "rgba(255,0,80,0.28)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: SAFE.bottom,
        bottom: 0,
        background: "rgba(255,0,80,0.28)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        height: SAFE.bottom - SAFE.top,
        left: SAFE.side,
        right: SAFE.side,
        border: "3px dashed rgba(0,255,170,0.9)",
      }}
    />
  </AbsoluteFill>
);
