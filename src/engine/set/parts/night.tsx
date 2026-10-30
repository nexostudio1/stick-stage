/**
 * The Catch's night kit: whole-frame backdrops with depth (a back wall, side walls, floor), a
 * hanging light with a cone and dust drifting in it. Colours are palette tokens only
 * (`night-shift`, `morning`). Rooms: kitchen, cafe, bookshop (this file); vault, ledger desk,
 * lost and found, evidence wall (`nightRooms.tsx`).
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import type { Palette } from "../palettes";
import type { PartComponent } from "./types";

export type Box = { x0: number; y0: number; x1: number; y1: number };

/** The back wall's rectangle: centred, `wf` of the width and `hf` of the height, its floor line at `fy`. */
export const backWall = (W: number, H: number, wf = 0.56, hf = 0.6, fy = 0.72): Box => ({ x0: W * (0.5 - wf / 2), x1: W * (0.5 + wf / 2), y0: H * fy - H * hf, y1: H * fy });

/** A room in one-point perspective: ceiling, side walls and floor run from the frame edges to the back wall. */
export const Room: React.FC<{ pal: Palette; W: number; H: number; b: Box }> = ({ pal, W, H, b }) => (
  <g>
    <rect width={W} height={H} fill={pal.wallA} />
    <polygon points={`0,0 ${W},0 ${f2(b.x1)},${f2(b.y0)} ${f2(b.x0)},${f2(b.y0)}`} fill={pal.shade} />
    <polygon points={`0,0 ${f2(b.x0)},${f2(b.y0)} ${f2(b.x0)},${f2(b.y1)} 0,${H}`} fill={pal.wallB} />
    <polygon points={`${W},0 ${f2(b.x1)},${f2(b.y0)} ${f2(b.x1)},${f2(b.y1)} ${W},${H}`} fill={darken(pal.wallB, 0.1)} />
    <polygon points={`0,${H} ${f2(b.x0)},${f2(b.y1)} ${f2(b.x1)},${f2(b.y1)} ${W},${H}`} fill={pal.floor} />
    {[0.25, 0.5, 0.75].map((k) => (
      <line key={k} x1={f2(b.x0 + (b.x1 - b.x0) * k)} y1={f2(b.y1)} x2={f2(W * k)} y2={H} stroke={darken(pal.floor, 0.12)} strokeWidth={2} />
    ))}
    <rect x={f2(b.x0)} y={f2(b.y0)} width={f2(b.x1 - b.x0)} height={f2(b.y1 - b.y0)} fill={pal.wallA} />
  </g>
);

/** A hanging lamp at (x, y) with a flickering cone to `floorY` and dust motes drifting in the light. */
export const Lamp: React.FC<{ pal: Palette; x: number; y: number; floorY: number; spread: number; frame: number; seed: string; strength?: number }> = ({ pal, x, y, floorY, spread, frame, seed, strength = 1 }) => {
  const t = frame / 30;
  const glow = pal.glow ?? pal.accent;
  const flick = 0.9 + 0.1 * noise(seed, "flicker", t * 3) * (noise(seed, "burst", t * 0.4) > 0.6 ? 2.5 : 1);
  const id = `cone-${seed}`;
  const h = floorY - y;
  const motes = Array.from({ length: 18 }, (_, i) => {
    const u = rand(seed, `u${i}`);
    const v = (rand(seed, `v${i}`) + t * 0.02 * (0.5 + u)) % 1;
    const dx = noise(seed, `m${i}`, t * 0.2) * spread * 0.15;
    return { x: x + (u - 0.5) * spread * v * 1.6 + dx, y: y + v * h, r: 1.5 + rand(seed, `r${i}`) * 2.5, a: 0.5 * Math.sin(Math.PI * v) };
  });
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow} stopOpacity={0.42 * strength} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </linearGradient>
      </defs>
      <line x1={f2(x)} y1={0} x2={f2(x)} y2={f2(y - 18)} stroke={darken(pal.wallB, 0.3)} strokeWidth={3} />
      <polygon points={`${f2(x - 40)},${f2(y)} ${f2(x + 40)},${f2(y)} ${f2(x + spread)},${f2(floorY)} ${f2(x - spread)},${f2(floorY)}`} fill={`url(#${id})`} opacity={flick} />
      <ellipse cx={f2(x)} cy={f2(floorY)} rx={f2(spread * 0.9)} ry={f2(spread * 0.12)} fill={glow} opacity={0.1 * strength * flick} />
      <path d={`M${f2(x - 46)},${f2(y)} L${f2(x - 24)},${f2(y - 26)} L${f2(x + 24)},${f2(y - 26)} L${f2(x + 46)},${f2(y)}Z`} fill={darken(pal.wallB, 0.25)} />
      <ellipse cx={f2(x)} cy={f2(y)} rx={34} ry={8} fill={lighten(glow, 0.5)} opacity={flick} />
      {motes.map((m, i) => (
        <circle key={i} cx={f2(m.x)} cy={f2(m.y)} r={f2(m.r)} fill={lighten(glow, 0.4)} opacity={f2(m.a * strength)} />
      ))}
    </g>
  );
};

/** Dark kitchen: wall cabinets, a counter along the back wall, an under-cabinet strip light, a fridge, a moonlit window. */
export const NightKitchen: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const b = backWall(W, H);
  const bw = b.x1 - b.x0;
  const counterY = b.y1 - (b.y1 - b.y0) * 0.36;
  const glow = pal.glow ?? pal.accent;
  const t = frame / 30;
  return (
    <g>
      <Room pal={pal} W={W} H={H} b={b} />
      <rect x={f2(b.x0 + bw * 0.62)} y={f2(b.y0 + 30)} width={f2(bw * 0.2)} height={f2((b.y1 - b.y0) * 0.3)} fill={mix(pal.sky, pal.wallA, 0.3)} />
      <circle cx={f2(b.x0 + bw * 0.76)} cy={f2(b.y0 + 70)} r={22} fill={lighten(pal.sky, 0.5)} opacity={0.8} />
      <line x1={f2(b.x0 + bw * 0.72)} x2={f2(b.x0 + bw * 0.72)} y1={f2(b.y0 + 30)} y2={f2(b.y0 + 30 + (b.y1 - b.y0) * 0.3)} stroke={pal.wallB} strokeWidth={8} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={f2(b.x0 + 16 + i * bw * 0.19)} y={f2(b.y0 + 16)} width={f2(bw * 0.18)} height={f2((b.y1 - b.y0) * 0.3)} rx={6} fill={pal.detail} stroke={darken(pal.detail, 0.2)} strokeWidth={3} />
      ))}
      <rect x={f2(b.x0)} y={f2(counterY - 10)} width={f2(bw)} height={14} fill={glow} opacity={0.5 + 0.1 * Math.sin(t * 7)} />
      <rect x={f2(b.x0)} y={f2(counterY)} width={f2(bw)} height={f2(b.y1 - counterY)} fill={darken(pal.wallB, 0.05)} />
      <rect x={f2(b.x0 - 20)} y={f2(counterY - 4)} width={f2(bw + 40)} height={18} fill={pal.detail} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={f2(b.x0 + 14 + (i * bw) / 4)} y={f2(counterY + 30)} width={f2(bw / 4 - 28)} height={f2(b.y1 - counterY - 46)} rx={6} fill={pal.wallB} stroke={darken(pal.wallB, 0.25)} strokeWidth={3} />
      ))}
      <polygon points={`${f2(W * 0.05)},${f2(H * 0.18)} ${f2(b.x0 - 30)},${f2(b.y0 + 30)} ${f2(b.x0 - 30)},${f2(b.y1)} ${f2(W * 0.05)},${f2(H * 0.95)}`} fill={pal.detail} stroke={darken(pal.detail, 0.25)} strokeWidth={4} />
      <rect x={0} y={f2(counterY - 6)} width={W} height={f2(H * 0.006)} fill={glow} opacity={0.06} />
    </g>
  );
};

/** A closed coffee shop: counter, espresso machine, a menu board, chairs up on tables, two pendant lamps. */
export const NightCafe: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const b = backWall(W, H, 0.6, 0.58, 0.7);
  const bw = b.x1 - b.x0;
  const counterY = b.y1 - (b.y1 - b.y0) * 0.38;
  return (
    <g>
      <Room pal={pal} W={W} H={H} b={b} />
      <rect x={f2(b.x0 + bw * 0.06)} y={f2(b.y0 + 24)} width={f2(bw * 0.38)} height={f2((b.y1 - b.y0) * 0.34)} rx={8} fill={darken(pal.wallA, 0.25)} stroke={pal.detail} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={f2(b.x0 + bw * 0.09)} y={f2(b.y0 + 54 + i * 34)} width={f2(bw * (0.2 + 0.1 * rand("menu", i)))} height={10} rx={5} fill={pal.detail} />
      ))}
      <rect x={f2(b.x0 + bw * 0.62)} y={f2(counterY - 150)} width={f2(bw * 0.2)} height={150} rx={10} fill={pal.detail} />
      <rect x={f2(b.x0 + bw * 0.65)} y={f2(counterY - 120)} width={f2(bw * 0.14)} height={30} rx={6} fill={darken(pal.detail, 0.3)} />
      <rect x={f2(b.x0)} y={f2(counterY)} width={f2(bw)} height={f2(b.y1 - counterY)} fill={darken(pal.wallB, 0.05)} />
      <rect x={f2(b.x0 - 24)} y={f2(counterY - 6)} width={f2(bw + 48)} height={18} fill={pal.detail} />
      {[0.12, 0.88].map((k, i) => (
        <g key={i} transform={`translate(${f2(W * k)} ${f2(H * 0.9)})`}>
          <rect x={-90} y={-14} width={180} height={14} fill={pal.detail} />
          <rect x={-8} y={0} width={16} height={60} fill={pal.detail} />
          <path d="M-50,-14 L-50,-120 L50,-120 L50,-14" fill="none" stroke={darken(pal.detail, 0.15)} strokeWidth={10} />
        </g>
      ))}
      <Lamp pal={pal} x={b.x0 + bw * 0.28} y={H * 0.12} floorY={H * 0.82} spread={W * 0.12} frame={frame} seed="cafe-a" />
      <Lamp pal={pal} x={b.x0 + bw * 0.72} y={H * 0.1} floorY={H * 0.82} spread={W * 0.12} frame={frame} seed="cafe-b" strength={0.6} />
    </g>
  );
};

/** A small bookshop in morning sun: tall shelves of spines, a window of daylight, a till counter. */
export const DayBookshop: PartComponent = ({ palette: pal, W, H }) => {
  const b = backWall(W, H, 0.62, 0.62, 0.72);
  const bw = b.x1 - b.x0;
  const spines = [pal.detail, pal.accent, mix(pal.detail, pal.wallA, 0.4), darken(pal.floor, 0.1), mix(pal.sky, pal.detail, 0.5)];
  const shelf = (x: number, y: number, w: number, rows: number, seed: string) => (
    <g>
      {Array.from({ length: rows }, (_, r) => {
        let cx = x;
        const books = [];
        let i = 0;
        while (cx < x + w - 20) {
          const bwid = 16 + rand(seed, `w${r}-${i}`) * 18;
          const bh = 70 + rand(seed, `h${r}-${i}`) * 30;
          books.push(<rect key={i} x={f2(cx)} y={f2(y + r * 120 + 110 - bh)} width={f2(bwid)} height={f2(bh)} fill={spines[Math.floor(rand(seed, `c${r}-${i}`) * spines.length)]} />);
          cx += bwid + 3;
          i++;
        }
        return (
          <g key={r}>
            {books}
            <rect x={f2(x - 6)} y={f2(y + r * 120 + 110)} width={f2(w + 12)} height={10} fill={darken(pal.floor, 0.2)} />
          </g>
        );
      })}
    </g>
  );
  return (
    <g>
      <Room pal={pal} W={W} H={H} b={b} />
      <rect x={f2(b.x0 + bw * 0.38)} y={f2(b.y0 + 20)} width={f2(bw * 0.24)} height={f2((b.y1 - b.y0) * 0.5)} fill={pal.sky} />
      <polygon points={`${f2(b.x0 + bw * 0.38)},${f2(b.y0 + 20)} ${f2(b.x0 + bw * 0.62)},${f2(b.y0 + 20)} ${f2(W * 0.75)},${H} ${f2(W * 0.3)},${H}`} fill={pal.glow ?? pal.accent} opacity={0.18} />
      {shelf(b.x0 + 20, b.y0 + 10, bw * 0.32, 3, "shelf-l")}
      {shelf(b.x0 + bw * 0.66, b.y0 + 10, bw * 0.32, 3, "shelf-r")}
      {shelf(W * 0.01, H * 0.12, b.x0 - W * 0.04, 5, "shelf-side")}
    </g>
  );
};
