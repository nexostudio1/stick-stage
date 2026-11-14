/** Medieval kit, outdoors: a fen (marsh with tide), a country road, and the flood water in front. */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import type { Palette } from "../palettes";
import type { PartComponent } from "./types";

/** Horizontal scroll for a "travel" variant: layers drift left at `speed` px per frame, wrapped. */
const drift = (frame: number, speed: number, W: number) => -((frame * speed) % W);

const Sky: React.FC<{ pal: Palette; W: number; H: number; id: string; frame: number }> = ({ pal, W, H, id, frame }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={darken(pal.wallB, 0.15)} />
        <stop offset="0.75" stopColor={pal.sky} />
        <stop offset="1" stopColor={lighten(pal.sky, 0.2)} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-sky)`} />
    {Array.from({ length: 5 }, (_, i) => {
      const y = H * (0.08 + 0.07 * i);
      const x = ((rand(id, `c${i}`) * W * 1.4 - frame * (0.25 + 0.1 * i)) % (W * 1.4)) + W * 0.2;
      return <ellipse key={i} cx={f2(x)} cy={f2(y)} rx={f2(W * (0.25 + 0.15 * rand(id, `w${i}`)))} ry={f2(H * 0.025)} fill={darken(pal.wallA, 0.1)} opacity={0.55} />;
    })}
  </g>
);

const Reeds: React.FC<{ pal: Palette; x: number; base: number; h: number; seed: string; frame: number; tone?: number }> = ({ pal, x, base, h, seed, frame, tone = 0 }) => (
  <g stroke={darken(pal.detail, tone)} strokeWidth={6} strokeLinecap="round" fill="none">
    {Array.from({ length: 7 }, (_, i) => {
      const dx = (i - 3) * 9;
      const sway = noise(seed, `r${i}`, frame / 45) * 14;
      const hh = h * (0.65 + 0.35 * rand(seed, `h${i}`));
      return <path key={i} d={`M${f2(x + dx)},${f2(base)} Q${f2(x + dx + sway * 0.4)},${f2(base - hh * 0.6)} ${f2(x + dx + sway)},${f2(base - hh)}`} />;
    })}
  </g>
);

/**
 * A fen at the edge of an estuary: heavy sky, a flat far shore, open water, a mud track.
 * Variants: `low` (default, tide out), `flood` (water over the track), `travel` (layers drift
 * left, a side-tracking camera).
 */
export const Fen: PartComponent = ({ part, palette: pal, W, H, groundY, prefix, frame = 0 }) => {
  const v = part.variant ?? "low";
  const flood = v === "flood";
  const travel = v === "travel";
  const water = mix(pal.sky, pal.shade, 0.35);
  const horizon = groundY - H * 0.2;
  const off = travel ? drift(frame, 6, W) : 0;
  const offFar = travel ? drift(frame, 1.5, W) : 0;
  const waterTop = flood ? groundY - H * 0.06 : groundY - H * 0.11;
  return (
    <g>
      <Sky pal={pal} W={W} H={H} id={`${prefix}-fen`} frame={frame} />
      <g transform={`translate(${f2(offFar)} 0)`}>
        {[0, W].map((ox) => (
          <path key={ox} d={`M${ox},${f2(horizon)} L${ox + W * 0.2},${f2(horizon - 30)} L${ox + W * 0.45},${f2(horizon - 12)} L${ox + W * 0.7},${f2(horizon - 40)} L${ox + W},${f2(horizon)} V${f2(horizon + 40)} H${ox} Z`} fill={pal.shade} opacity={0.7} />
        ))}
      </g>
      <rect y={f2(horizon)} width={W} height={f2(waterTop - horizon + 4)} fill={water} />
      {Array.from({ length: 12 }, (_, i) => {
        const y = horizon + ((i + 1) / 13) * (waterTop - horizon);
        const x = (rand(prefix, `w${i}`) * W + frame * 2 * (i % 2 ? 1 : -1)) % W;
        return <line key={i} x1={f2(x)} x2={f2(x + 60 + i * 6)} y1={f2(y)} y2={f2(y)} stroke={lighten(water, 0.25)} strokeWidth={3} opacity={0.6} />;
      })}
      <path d={`M0,${f2(waterTop)} Q${W * 0.5},${f2(waterTop - 14)} ${W},${f2(waterTop)} V${H} H0 Z`} fill={pal.floor} />
      <g transform={`translate(${f2(off)} 0)`}>
        {[0, W].map((ox) => (
          <g key={ox}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={f2(ox + rand(prefix, `p${i}`) * W)} cy={f2(waterTop + 30 + rand(prefix, `q${i}`) * (groundY - waterTop))} rx={f2(40 + 50 * rand(prefix, `s${i}`))} ry={8} fill={flood ? lighten(water, 0.1) : darken(pal.floor, 0.12)} opacity={0.8} />
            ))}
            <Reeds pal={pal} x={ox + W * 0.08} base={waterTop + 10} h={H * 0.09} seed={`${prefix}a`} frame={frame} tone={0.1} />
            <Reeds pal={pal} x={ox + W * 0.62} base={waterTop + 6} h={H * 0.07} seed={`${prefix}b`} frame={frame} tone={0.1} />
            <Reeds pal={pal} x={ox + W * 0.9} base={groundY + 40} h={H * 0.12} seed={`${prefix}c`} frame={frame} />
          </g>
        ))}
      </g>
      {flood ? <rect y={f2(waterTop)} width={W} height={f2(H - waterTop)} fill={water} opacity={0.55} /> : null}
    </g>
  );
};

/**
 * The tide in front of the cast (a foreground part): a translucent band of water from `y`
 * (fraction of height, default just above the feet) down, with moving ripples.
 */
export const FloodWater: PartComponent = ({ part, palette: pal, W, H, groundY, frame = 0 }) => {
  const top = part.y !== undefined ? part.y * H : groundY - H * 0.05;
  const water = mix(pal.sky, pal.shade, 0.35);
  const wave = (k: number) =>
    `M0,${f2(top + 6 * k)} ` + Array.from({ length: 13 }, (_, i) => `Q${f2((i + 0.5) * (W / 12))},${f2(top + 6 * k + Math.sin(frame / 8 + i + k) * 10)} ${f2((i + 1) * (W / 12))},${f2(top + 6 * k)}`).join(" ") + ` V${H} H0 Z`;
  return (
    <g>
      <path d={wave(0)} fill={water} opacity={0.72} />
      <path d={wave(3)} fill={darken(water, 0.1)} opacity={0.5} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={f2(((i * W) / 6 + frame * 3) % W)} x2={f2((((i * W) / 6 + frame * 3) % W) + 70)} y1={f2(top + 40 + i * 18)} y2={f2(top + 40 + i * 18)} stroke={lighten(water, 0.35)} strokeWidth={4} opacity={0.7} />
      ))}
    </g>
  );
};

/** A country road through low hills, evening light. Variant `travel` drifts the near layers. */
export const MedievalRoad: PartComponent = ({ part, palette: pal, W, H, groundY, prefix, frame = 0 }) => {
  const travel = part.variant === "travel";
  const off = travel ? drift(frame, 5, W) : 0;
  const mid = travel ? drift(frame, 2, W) : 0;
  return (
    <g>
      <Sky pal={pal} W={W} H={H} id={`${prefix}-road`} frame={frame} />
      <circle cx={W * 0.72} cy={groundY - H * 0.38} r={W * 0.09} fill={pal.glow ?? pal.accent} opacity={0.85} />
      <g transform={`translate(${f2(mid)} 0)`}>
        {[0, W].map((ox) => (
          <path key={ox} d={`M${ox},${f2(groundY - H * 0.16)} Q${ox + W * 0.25},${f2(groundY - H * 0.26)} ${ox + W * 0.5},${f2(groundY - H * 0.17)} T${ox + W},${f2(groundY - H * 0.16)} V${f2(groundY)} H${ox} Z`} fill={pal.detail} />
        ))}
      </g>
      <g transform={`translate(${f2(off)} 0)`}>
        {[0, W].map((ox) =>
          [0.15, 0.55, 0.85].map((k, i) => {
            const x = ox + W * k;
            const y = groundY - H * 0.12;
            return (
              <g key={`${ox}-${i}`}>
                <rect x={f2(x - 7)} y={f2(y - 70)} width={14} height={80} fill={darken(pal.detail, 0.35)} />
                <circle cx={f2(x)} cy={f2(y - 100)} r={f2(55 + 15 * rand(prefix, `t${i}`))} fill={darken(pal.detail, 0.15)} />
              </g>
            );
          }),
        )}
      </g>
      <rect y={f2(groundY - H * 0.1)} width={W} height={f2(H - groundY + H * 0.1)} fill={pal.floor} />
      <path d={`M0,${f2(groundY + 20)} L${W},${f2(groundY - 10)} L${W},${f2(groundY + 90)} L0,${f2(groundY + 130)} Z`} fill={lighten(pal.floor, 0.12)} />
    </g>
  );
};
