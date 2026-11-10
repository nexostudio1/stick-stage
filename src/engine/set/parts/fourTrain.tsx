/**
 * The `four` kit's commuter train (the relatable four-person channel). A whole-frame carriage
 * interior seen from the aisle: ceiling with a strap rail, an ad strip, two big windows, a lower
 * panel and the floor. Outside the windows the country scrolls past in three parallax layers
 * (variant "moving", the default) or a platform stands still ("station").
 *
 * Seats (`four-train-seat`) and the grab pole (`four-train-pole`, foreground) are separate parts so a
 * set can place them on its marks. Colours are palette tokens only (`four-train`); ambient motion
 * runs off the composition frame.
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import type { Palette } from "../palettes";
import { SEAT_HEIGHT } from "./seats";
import { edge, partBase, partX, SET_LINE, type PartComponent } from "./types";

const FPS = 30;

/** Window band, as fractions of frame height. */
export const TRAIN_WINDOW = { top: 0.17, bottom: 0.5 } as const;

const sceneryOf = (pal: Palette) =>
  pal.scenery ?? { far: mix(pal.sky, pal.detail, 0.3), mid: mix(pal.detail, pal.sky, 0.3), near: darken(pal.detail, 0.15), ground: pal.floor };

/** A tile of `n` points along a seeded wavy ridge, `w` wide, closed down to `bottom`. Tiles end where they start. */
const ridge = (seed: string, key: string, w: number, top: number, amp: number, bottom: number, n = 12): string => {
  const pts: string[] = [];
  const y0 = top + amp * 0.5;
  for (let i = 0; i <= n; i++) {
    const x = (w * i) / n;
    const y = i === 0 || i === n ? y0 : top + amp * rand(seed, `${key}${i}`);
    pts.push(`${f2(x)},${f2(y)}`);
  }
  return `M0,${f2(bottom)} L${pts.join(" L")} L${f2(w)},${f2(bottom)} Z`;
};

/** Draw `tile` twice so it scrolls left forever at `speed` px/s. */
const Scroll: React.FC<{ frame: number; speed: number; w: number; children: React.ReactNode }> = ({ frame, speed, w, children }) => {
  const off = -((frame / FPS) * speed) % w;
  return (
    <g>
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${f2(off + k * w)} 0)`}>
          {children}
        </g>
      ))}
    </g>
  );
};

/** The view through the windows, clipped by the caller. */
const Outside: React.FC<{ pal: Palette; W: number; y0: number; y1: number; frame: number; seed: string; station: boolean }> = ({ pal, W, y0, y1, frame, seed, station }) => {
  const s = sceneryOf(pal);
  const h = y1 - y0;
  const horizon = y0 + h * 0.7;
  const grad = `${seed}-sky`;
  const sky = (
    <>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky} />
          <stop offset="1" stopColor={lighten(pal.sky, 0.45)} />
        </linearGradient>
      </defs>
      <rect x={0} y={y0} width={W} height={h} fill={`url(#${grad})`} />
    </>
  );
  if (station) {
    // A platform at a standstill: tiled back wall, a sign, the yellow safety line, the platform edge.
    const tile = h * 0.12;
    const edgeY = y0 + h * 0.8;
    return (
      <g>
        {sky}
        <rect x={0} y={y0 + h * 0.18} width={W} height={edgeY - y0 - h * 0.18} fill={lighten(pal.wallB, 0.55)} />
        {Array.from({ length: Math.ceil(W / tile) + 1 }, (_, i) => (
          <line key={i} x1={f2(i * tile)} x2={f2(i * tile)} y1={f2(y0 + h * 0.18)} y2={f2(edgeY)} stroke={lighten(pal.wallB, 0.4)} strokeWidth={2} />
        ))}
        <rect x={0} y={y0 + h * 0.18} width={W} height={h * 0.06} fill={pal.detail} />
        <rect x={W * 0.56} y={y0 + h * 0.32} width={W * 0.3} height={h * 0.13} rx={8} fill={pal.shade} />
        <rect x={W * 0.58} y={y0 + h * 0.37} width={W * 0.26} height={h * 0.03} rx={4} fill={lighten(pal.shade, 0.5)} />
        <rect x={0} y={edgeY} width={W} height={y1 - edgeY} fill={mix(pal.floor, pal.wallA, 0.45)} />
        <rect x={0} y={edgeY + h * 0.03} width={W} height={h * 0.025} fill={pal.glow ?? pal.accent} />
      </g>
    );
  }
  const farW = W * 1.6;
  const midW = W * 1.2;
  const postGap = W * 0.55;
  const sunX = W * 0.74;
  const sunY = y0 + h * 0.2;
  const glow = pal.glow ?? pal.accent;
  return (
    <g>
      {sky}
      <circle cx={f2(sunX)} cy={f2(sunY)} r={h * 0.16} fill={glow} opacity={0.25} />
      <circle cx={f2(sunX)} cy={f2(sunY)} r={h * 0.08} fill={glow} />
      {/* Clouds drift slower than anything on the ground. */}
      <Scroll frame={frame} speed={18} w={W * 1.4}>
        {[0.15, 0.7].map((k, i) => (
          <g key={k} fill={lighten(pal.sky, 0.75)}>
            <ellipse cx={f2(W * 1.4 * k)} cy={f2(y0 + h * (0.14 + 0.1 * i))} rx={W * 0.11} ry={h * 0.05} />
            <ellipse cx={f2(W * 1.4 * k + W * 0.07)} cy={f2(y0 + h * (0.11 + 0.1 * i))} rx={W * 0.07} ry={h * 0.05} />
          </g>
        ))}
      </Scroll>
      <Scroll frame={frame} speed={45} w={farW}>
        <path d={ridge(seed, "far", farW, horizon - h * 0.22, h * 0.16, y1)} fill={s.far} />
      </Scroll>
      <Scroll frame={frame} speed={210} w={midW}>
        <path d={ridge(seed, "mid", midW, horizon - h * 0.08, h * 0.1, y1, 18)} fill={s.mid} />
        {[0.12, 0.31, 0.58, 0.83].map((k, i) => {
          const x = midW * k;
          const r = h * (0.07 + 0.03 * rand(seed, `tree${i}`));
          return (
            <g key={k}>
              <rect x={f2(x - r * 0.12)} y={f2(horizon - r * 0.4)} width={f2(r * 0.24)} height={f2(r * 0.9)} fill={darken(s.near, 0.25)} />
              <circle cx={f2(x)} cy={f2(horizon - r * 0.7)} r={f2(r)} fill={s.near} />
            </g>
          );
        })}
      </Scroll>
      <rect x={0} y={f2(horizon + h * 0.08)} width={W} height={f2(y1 - horizon)} fill={s.ground} />
      {/* Near telegraph poles whip past: thin, dark, a soft blur trail behind each. */}
      <Scroll frame={frame} speed={1400} w={postGap * 2.2}>
        <rect x={f2(postGap * 0.3)} y={f2(y0 + h * 0.08)} width={f2(W * 0.05)} height={f2(h)} fill={darken(s.near, 0.3)} opacity={0.18} />
        <rect x={f2(postGap * 0.3 + W * 0.035)} y={f2(y0 + h * 0.08)} width={f2(W * 0.014)} height={f2(h)} fill={darken(s.near, 0.4)} opacity={0.75} />
      </Scroll>
      {/* Speed streaks along the near ground. */}
      <Scroll frame={frame} speed={900} w={W * 0.7}>
        {[0.1, 0.45].map((k, i) => (
          <rect key={k} x={f2(W * 0.7 * k)} y={f2(horizon + h * (0.13 + 0.07 * i))} width={f2(W * 0.18)} height={4} rx={2} fill={darken(s.ground, 0.2)} opacity={0.5} />
        ))}
      </Scroll>
    </g>
  );
};

/** The carriage: ceiling, strap rail with swaying straps, ad strip, windows (moving or station), panels, floor. */
export const FourTrainBay: PartComponent = ({ part, palette: pal, W, H, groundY, fig, seed, prefix, frame = 0 }) => {
  const t = frame / FPS;
  const station = part.variant === "station";
  const wy0 = H * TRAIN_WINDOW.top;
  const wy1 = H * TRAIN_WINDOW.bottom;
  const pad = W * 0.05;
  const gap = W * 0.06;
  const ww = (W - pad * 2 - gap) / 2;
  const wins = [pad, pad + ww + gap];
  const clip = `${prefix}-win`;
  const frameC = pal.shade;
  const panelTop = groundY - fig * 0.5;
  const railY = H * 0.075;
  // Straps sway together with a small lag each, as a carriage rocks (still at a station).
  const sway = (i: number) => (station ? 0 : 7 * Math.sin(t * 2.2 + i * 0.5) + 3 * noise(seed, `s${i}`, t * 0.8));
  return (
    <g>
      <rect width={W} height={H} fill={pal.wallA} />
      <defs>
        <clipPath id={clip}>
          {wins.map((x) => (
            <rect key={x} x={f2(x)} y={f2(wy0)} width={f2(ww)} height={f2(wy1 - wy0)} rx={W * 0.04} />
          ))}
        </clipPath>
      </defs>
      {/* Ceiling and light strip. */}
      <rect width={W} height={H * 0.06} fill={lighten(pal.shade, 0.7)} />
      <rect x={W * 0.08} y={H * 0.02} width={W * 0.84} height={H * 0.014} rx={8} fill={lighten(pal.glow ?? pal.wallA, 0.5)} />
      {/* Ad strip: three bright cards. */}
      {[0.06, 0.38, 0.7].map((k, i) => (
        <g key={k}>
          <rect x={f2(W * k)} y={f2(H * 0.1)} width={f2(W * 0.24)} height={f2(H * 0.045)} rx={10} fill={[pal.accent, pal.wallB, pal.detail][i]} stroke={edge(pal.wallA, 0.2)} strokeWidth={SET_LINE} />
          <rect x={f2(W * (k + 0.03))} y={f2(H * 0.117)} width={f2(W * 0.12)} height={f2(H * 0.008)} rx={4} fill={lighten(pal.wallA, 0.2)} opacity={0.85} />
        </g>
      ))}
      {/* Windows: the view, a frame, a sheen. */}
      <g clipPath={`url(#${clip})`}>
        <Outside pal={pal} W={W} y0={wy0} y1={wy1} frame={frame} seed={seed} station={station} />
        <polygon points={`${f2(W * 0.1)},${f2(wy1)} ${f2(W * 0.22)},${f2(wy0)} ${f2(W * 0.28)},${f2(wy0)} ${f2(W * 0.16)},${f2(wy1)}`} fill={lighten(pal.sky, 0.9)} opacity={0.14} />
        <polygon points={`${f2(W * 0.6)},${f2(wy1)} ${f2(W * 0.72)},${f2(wy0)} ${f2(W * 0.75)},${f2(wy0)} ${f2(W * 0.63)},${f2(wy1)}`} fill={lighten(pal.sky, 0.9)} opacity={0.14} />
      </g>
      {wins.map((x) => (
        <rect key={x} x={f2(x)} y={f2(wy0)} width={f2(ww)} height={f2(wy1 - wy0)} rx={W * 0.04} fill="none" stroke={frameC} strokeWidth={W * 0.018} />
      ))}
      <rect x={pad} y={f2(wy1 + H * 0.012)} width={f2(W - pad * 2)} height={H * 0.012} rx={6} fill={lighten(frameC, 0.35)} />
      {/* Lower panel with a stripe, then the floor. */}
      <rect x={0} y={f2(panelTop)} width={W} height={f2(groundY - panelTop)} fill={pal.wallB} />
      <rect x={0} y={f2(panelTop)} width={W} height={fig * 0.03} fill={pal.accent} />
      <rect x={0} y={f2(groundY)} width={W} height={f2(H - groundY)} fill={pal.floor} />
      <rect x={0} y={f2(groundY)} width={W} height={fig * 0.02} fill={darken(pal.floor, 0.12)} />
      {[0.3, 0.62].map((k) => (
        <line key={k} x1={0} x2={W} y1={f2(groundY + (H - groundY) * k)} y2={f2(groundY + (H - groundY) * k)} stroke={darken(pal.floor, 0.08)} strokeWidth={SET_LINE} />
      ))}
      {/* Strap rail and straps. */}
      <rect x={0} y={f2(railY)} width={W} height={H * 0.008} rx={4} fill={darken(pal.wallA, 0.25)} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = W * (0.09 + i * 0.165);
        const len = H * 0.05;
        return (
          <g key={i} transform={`rotate(${f2(sway(i))} ${f2(x)} ${f2(railY)})`}>
            <rect x={f2(x - 6)} y={f2(railY)} width={12} height={f2(len)} rx={5} fill={pal.accent} />
            <circle cx={f2(x)} cy={f2(railY + len + 18)} r={20} fill="none" stroke={darken(pal.accent, 0.1)} strokeWidth={9} />
          </g>
        );
      })}
    </g>
  );
};

/** A double seat with a high back, in the carriage's moquette. Seats two (`seatFor` both marks). */
export const FourTrainSeat: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const w = s * 0.9;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const seatTop = base - SEAT_HEIGHT["four-train-seat"] * s;
  const backTop = base - s * 0.66;
  const x0 = cx - w / 2;
  const fill = pal.detail;
  const dark = darken(fill, 0.12);
  const dots = Array.from({ length: 14 }, (_, i) => ({ x: x0 + w * (0.08 + 0.84 * ((i * 0.37) % 1)), y: backTop + (seatTop - backTop) * (0.15 + 0.7 * ((i * 0.53) % 1)) }));
  return (
    <g stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      <rect x={f2(x0)} y={f2(backTop)} width={f2(w)} height={f2(seatTop - backTop + s * 0.04)} rx={s * 0.06} fill={fill} />
      {dots.map((d, i) => (
        <circle key={i} cx={f2(d.x)} cy={f2(d.y)} r={s * 0.012} fill={lighten(fill, 0.25)} stroke="none" />
      ))}
      {[0.27, 0.73].map((k) => (
        <rect key={k} x={f2(x0 + w * k - s * 0.1)} y={f2(backTop - s * 0.015)} width={f2(s * 0.2)} height={f2(s * 0.09)} rx={s * 0.02} fill={lighten(pal.wallA, 0.3)} />
      ))}
      <line x1={f2(cx)} x2={f2(cx)} y1={f2(backTop + s * 0.08)} y2={f2(seatTop)} stroke={dark} />
      <rect x={f2(x0 - s * 0.02)} y={f2(seatTop)} width={f2(w + s * 0.04)} height={f2(s * 0.08)} rx={s * 0.03} fill={lighten(fill, 0.06)} />
      <rect x={f2(x0 + s * 0.02)} y={f2(seatTop + s * 0.08)} width={f2(w - s * 0.04)} height={f2(base - seatTop - s * 0.08)} fill={dark} />
    </g>
  );
};

/** A floor-to-ceiling grab pole, drawn over the cast (foreground) for depth. */
export const FourTrainPole: PartComponent = ({ part, palette: pal, W, H, fig, marks }) => {
  const x = partX(part, W, marks, 0.5);
  const r = fig * 0.022 * part.size;
  const metal = mix(pal.shade, pal.wallA, 0.55);
  return (
    <g>
      <rect x={f2(x - r)} y={0} width={f2(r * 2)} height={H} fill={metal} stroke={edge(metal, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(x - r * 0.45)} y={0} width={f2(r * 0.35)} height={H} fill={lighten(metal, 0.55)} />
    </g>
  );
};
