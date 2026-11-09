/**
 * Themed science grounds for the shorts' cutaway ("science aside"): a slowly shifting gradient,
 * soft drifting glows and one family of low-contrast shapes per theme, in two parallax layers.
 * Frame-pure and seeded (AGENTS.md rule 1): every position is a function of `frame` and the seed.
 *
 * `variant` picks the shapes: `dawn` (a sun with orbits, for time and the Earth), `tide` (waves and
 * ripples, for the sea and the Moon), `cosmos` (tilted rings and twinkles, for space) and `lab`
 * (rising bubbles over a hex grid, for chemistry and biology). The colours come from the set's
 * palette, so each variant pairs with its own `science-*` palette but works with any.
 *
 * Text stays readable: the shapes are masked down inside the figure band (y 0.22-0.38 of the
 * frame, where cards and the hook sit) and toward the subtitles at the bottom. On a wide frame (the
 * `explainer-*` grounds) they keep to the edges instead and fade behind the centre.
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand, randRange } from "../../lib/seed";
import type { Palette } from "../palettes";
import type { PartComponent } from "./types";

export const SCIENCE_VARIANTS = ["dawn", "tide", "cosmos", "lab"] as const;
export type ScienceVariant = (typeof SCIENCE_VARIANTS)[number];

/** Seconds per full colour drift of the gradient. */
const DRIFT_S = 24;

type Layer = { pal: Palette; W: number; H: number; groundY: number; fig: number; t: number; seed: string; depth: number; ink: string };

/** A sun near the top with orbit rings and planets moving along them (back layer slower). */
const Dawn: React.FC<Layer> = ({ W, groundY, fig, t, seed, depth, ink }) => {
  const cx = W * randRange(seed, "sx", 0.62, 0.8);
  const cy = groundY * randRange(seed, "sy", 0.1, 0.16);
  const rings = depth ? [1.6, 2.5] : [0.75, 1.15];
  return (
    <g>
      {depth ? null : <circle cx={f2(cx)} cy={f2(cy)} r={f2(fig * 0.11)} fill={ink} opacity={0.35} />}
      {rings.map((k, i) => {
        const rx = fig * 0.55 * k;
        const ry = rx * 0.42;
        const a = randRange(seed, `a${depth}${i}`, 0, Math.PI * 2) + (t * (depth ? 0.05 : 0.11)) / k;
        return (
          <g key={i} transform={`rotate(${f2(-14 + 6 * i)} ${f2(cx)} ${f2(cy)})`}>
            <ellipse cx={f2(cx)} cy={f2(cy)} rx={f2(rx)} ry={f2(ry)} fill="none" stroke={ink} strokeWidth={3} opacity={0.5} />
            <circle cx={f2(cx + rx * Math.cos(a))} cy={f2(cy + ry * Math.sin(a))} r={f2(fig * (depth ? 0.018 : 0.026))} fill={ink} />
          </g>
        );
      })}
    </g>
  );
};

/** Travelling sine lines low in the frame and ripples that grow and fade. */
const Tide: React.FC<Layer> = ({ W, groundY, fig, t, seed, depth, ink }) => {
  const lines = depth ? [0.5, 0.62] : [0.72, 0.82, 0.9];
  const ripples = depth ? 0 : 3;
  return (
    <g>
      {lines.map((y, i) => {
        const amp = fig * (depth ? 0.02 : 0.035);
        const k = (Math.PI * 2) / (W * randRange(seed, `w${depth}${i}`, 0.5, 0.8));
        const ph = t * (depth ? 0.25 : 0.5) * (i % 2 ? -1 : 1) + rand(seed, `p${i}`) * 6;
        const pts = Array.from({ length: 25 }, (_, j) => {
          const x = (W * j) / 24;
          return `${f2(x)},${f2(groundY * y + amp * Math.sin(k * x + ph))}`;
        });
        return <polyline key={i} points={pts.join(" ")} fill="none" stroke={ink} strokeWidth={4} opacity={0.55} strokeLinecap="round" />;
      })}
      {Array.from({ length: ripples }, (_, i) => {
        const u = (t / 7 + rand(seed, `r${i}`)) % 1;
        const cx = W * randRange(seed, `rx${i}`, 0.15, 0.85);
        const cy = groundY * randRange(seed, `ry${i}`, 0.08, 0.18);
        return <circle key={`r${i}`} cx={f2(cx)} cy={f2(cy)} r={f2(fig * (0.05 + 0.35 * u))} fill="none" stroke={ink} strokeWidth={3} opacity={f2(0.6 * (1 - u))} />;
      })}
    </g>
  );
};

/** Tilted planetary rings that turn slowly, and twinkling four-point sparkles. */
const Cosmos: React.FC<Layer> = ({ W, groundY, fig, t, seed, depth, ink }) => {
  const n = depth ? 22 : 10;
  const turn = t * (depth ? 0.6 : 1.4);
  const rcx = W * randRange(seed, "cx", 0.2, 0.35);
  const rcy = groundY * randRange(seed, "cy", 0.12, 0.18);
  return (
    <g>
      {depth ? null : (
        <g transform={`rotate(${f2(-20 + turn)} ${f2(rcx)} ${f2(rcy)})`}>
          <circle cx={f2(rcx)} cy={f2(rcy)} r={f2(fig * 0.09)} fill={ink} opacity={0.3} />
          {[0.18, 0.24].map((r, i) => <ellipse key={i} cx={f2(rcx)} cy={f2(rcy)} rx={f2(fig * r)} ry={f2(fig * r * 0.28)} fill="none" stroke={ink} strokeWidth={3} opacity={0.6} />)}
        </g>
      )}
      {Array.from({ length: n }, (_, i) => {
        const x = W * rand(seed, `x${depth}${i}`);
        const y = groundY * randRange(seed, `y${depth}${i}`, 0.02, 0.95);
        const tw = 0.5 + 0.5 * Math.sin(t * randRange(seed, `f${i}`, 0.8, 1.8) + rand(seed, `q${i}`) * 6.28);
        const r = fig * (depth ? 0.008 : randRange(seed, `s${i}`, 0.012, 0.022)) * (0.6 + 0.4 * tw);
        return (
          <path key={i} d={`M ${f2(x - r * 2)} ${f2(y)} Q ${f2(x)} ${f2(y)} ${f2(x)} ${f2(y - r * 2)} Q ${f2(x)} ${f2(y)} ${f2(x + r * 2)} ${f2(y)} Q ${f2(x)} ${f2(y)} ${f2(x)} ${f2(y + r * 2)} Q ${f2(x)} ${f2(y)} ${f2(x - r * 2)} ${f2(y)} Z`} fill={ink} opacity={f2(0.35 + 0.65 * tw)} />
        );
      })}
    </g>
  );
};

/** A faint hex grid (back) and bubbles rising and swaying (front). */
const Lab: React.FC<Layer> = ({ W, groundY, fig, t, seed, depth, ink }) => {
  if (depth) {
    const s = fig * 0.12;
    const h = s * Math.sqrt(3);
    const cells: React.ReactNode[] = [];
    for (let r = 0; r * h * 0.5 < groundY + h; r++) {
      for (let c = 0; c * s * 3 < W + s * 3; c++) {
        const x = c * s * 3 + (r % 2) * s * 1.5;
        const y = r * h * 0.5;
        const d = Array.from({ length: 6 }, (_, k) => `${f2(x + s * Math.cos((k * Math.PI) / 3))},${f2(y + s * Math.sin((k * Math.PI) / 3))}`).join(" ");
        cells.push(<polygon key={`${r}-${c}`} points={d} fill="none" stroke={ink} strokeWidth={2} />);
      }
    }
    return <g opacity={0.35}>{cells}</g>;
  }
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const speed = randRange(seed, `v${i}`, 0.025, 0.06);
        const u = (rand(seed, `u${i}`) + t * speed) % 1;
        const x = W * rand(seed, `x${i}`) + noise(seed, `sway${i}`, t * 0.3) * fig * 0.06;
        const y = groundY * (1 - u);
        const r = fig * randRange(seed, `r${i}`, 0.015, 0.04);
        return <circle key={i} cx={f2(x)} cy={f2(y)} r={f2(r)} fill="none" stroke={ink} strokeWidth={3} opacity={f2(0.7 * Math.sin(Math.PI * u))} />;
      })}
    </g>
  );
};

const SHAPES: Record<ScienceVariant, React.FC<Layer>> = { dawn: Dawn, tide: Tide, cosmos: Cosmos, lab: Lab };

/** The themed science backdrop: gradient, glows, then masked back and front shape layers. */
export const ScienceWash: PartComponent = ({ part, palette: pal, W, H, groundY, fig, prefix, seed, frame = 0 }) => {
  const variant = (SCIENCE_VARIANTS as readonly string[]).includes(part.variant ?? "") ? (part.variant as ScienceVariant) : "dawn";
  const Shapes = SHAPES[variant];
  const t = frame / 30;
  const id = `${prefix}-sci`;
  const wide = W > H;
  // The gradient's stops breathe between the palette's tones over DRIFT_S seconds.
  const k = 0.5 + 0.5 * Math.sin((t / DRIFT_S) * Math.PI * 2);
  const top = mix(pal.wallB, pal.shade, 0.35 * k);
  const mid = mix(pal.wallA, pal.sky, 0.25 + 0.2 * (1 - k));
  const low = mix(pal.wallA, pal.wallB, 0.4 + 0.3 * k);
  const glows = [pal.sky, pal.accent, pal.shade].map((c, i) => ({
    c,
    x: W * (randRange(seed, `gx${i}`, 0.15, 0.85) + 0.12 * noise(seed, `gdx${i}`, t * 0.04)),
    y: groundY * (randRange(seed, `gy${i}`, 0.1, 0.8) + 0.06 * noise(seed, `gdy${i}`, t * 0.035)),
    r: fig * randRange(seed, `gr${i}`, 0.6, 0.95),
  }));
  const ink = lighten(pal.detail, 0.15);
  const sway = (amp: number, rate: number) => f2(W * amp * Math.sin(t * rate + rand(seed, "ph") * 6.28));
  const layer = { pal, W, H, groundY, fig, t, seed, ink };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        {glows.map((g, i) => (
          <radialGradient key={i} id={`${id}-g${i}`}>
            <stop offset="0" stopColor={g.c} stopOpacity="0.45" />
            <stop offset="1" stopColor={g.c} stopOpacity="0" />
          </radialGradient>
        ))}
        {/* Shapes fade inside the card band and near the floor, where text and the cast sit. */}
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.24" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.36" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="1" />
          <stop offset={f2((groundY * 0.92) / H)} stopColor="#fff" stopOpacity="0.8" />
          <stop offset={f2(groundY / H)} stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        {/* Wide (16:9 explainers): figures fill the middle, so the shapes keep to the edges. */}
        <radialGradient id={`${id}-wide`} cx="0.5" cy="0.48" r="0.62">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${id}-${wide ? "wide" : "band"})`} />
        </mask>
      </defs>
      <rect width={W} height={groundY + 2} fill={`url(#${id}-bg)`} />
      {glows.map((g, i) => (
        <ellipse key={i} cx={f2(g.x)} cy={f2(g.y)} rx={f2(g.r)} ry={f2(g.r * 0.8)} fill={`url(#${id}-g${i})`} />
      ))}
      <g mask={`url(#${id}-mask)`} opacity={0.3}>
        <g transform={`translate(${sway(0.008, 0.11)} 0)`} opacity={0.6}>
          <Shapes {...layer} depth={1} />
        </g>
        <g transform={`translate(${sway(0.02, 0.16)} 0)`}>
          <Shapes {...layer} depth={0} />
        </g>
      </g>
      {/* The floor shadow under a short's cast; a wide explainer has no floor, so it would read as a stripe. */}
      {wide ? null : <rect y={groundY * 0.82} width={W} height={groundY * 0.18 + 2} fill={darken(low, 0.2)} opacity={0.18} />}
    </g>
  );
};
