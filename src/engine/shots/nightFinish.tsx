import React, { useId } from "react";
import { f2 } from "../lib/math";
import { noise } from "../lib/seed";
import type { Camera } from "./Stage";

/*
 * The "night" finish (The Catch): film grain and a heavy vignette over the frame, and a camera
 * that never fully stops (a slow 1–2 % drift and a breathing zoom), so no frame is a still slide.
 */

/** The drift added to the director's camera at a frame: a slow seeded wander plus a 1.5 % breathe. */
export const nightDrift = (cam: Camera, frame: number, width: number, height: number): Camera => {
  const t = frame / 30;
  const k = Math.min(width, height);
  return {
    scale: cam.scale * (1.02 + 0.012 * Math.sin(t * 0.35)),
    cx: cam.cx + noise("night", "drift-x", t * 0.12) * k * 0.012,
    cy: cam.cy + noise("night", "drift-y", t * 0.1) * k * 0.008,
  };
};

/**
 * Grain and vignette in screen space. Nothing in it changes between frames, so it sits on its own
 * compositor layer and Chrome rasterises the turbulence once.
 */
export const NightOverlay: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scale = Math.min(width, height) / 1080;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", willChange: "transform" }}>
      <defs>
        <radialGradient id={`v${uid}`} cx="0.5" cy="0.47" r="0.78">
          <stop offset="0.5" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.62} />
        </radialGradient>
        <filter id={`g${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={f2(0.85 / scale)} numOctaves={2} seed={4} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0.1 0" />
        </filter>
      </defs>
      <rect width={width} height={height} fill={`url(#v${uid})`} />
      <rect width={width} height={height} filter={`url(#g${uid})`} />
    </svg>
  );
};
