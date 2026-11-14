/** Medieval kit, things and rooms: baggage cart, horse, castle hall, a crown on a dark ground. */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise } from "../../lib/seed";
import { derived } from "../palettes";
import { edge, flipAt, partBase, partX, SET_LINE, type PartComponent } from "./types";

const Wheel: React.FC<{ x: number; y: number; r: number; spin: number; wood: string }> = ({ x, y, r, spin, wood }) => (
  <g transform={`translate(${f2(x)} ${f2(y)}) rotate(${f2(spin)})`}>
    <circle r={r} fill="none" stroke={darken(wood, 0.25)} strokeWidth={r * 0.18} />
    {[0, 45, 90, 135].map((a) => (
      <line key={a} x1={-r} x2={r} transform={`rotate(${a})`} stroke={darken(wood, 0.2)} strokeWidth={r * 0.09} />
    ))}
    <circle r={r * 0.16} fill={darken(wood, 0.35)} />
  </g>
);

/**
 * A two-wheeled baggage cart with chests and sacks. Variants: `moving` (wheels turn, it bobs),
 * `stuck` (sunk and tilted, wheels still), `sinking` (sinks over ~4 s of composition time).
 */
export const Cart: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks, frame = 0 }) => {
  const d = derived(pal);
  const x = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const s = part.size * fig;
  const r = s * 0.17;
  const v = part.variant ?? "moving";
  const moving = v === "moving";
  const sinkT = v === "sinking" ? Math.min(1, (frame % 240) / 120) : v === "stuck" ? 1 : 0;
  const sink = sinkT * s * 0.14;
  const tilt = sinkT * -7;
  const bob = moving ? Math.sin(frame / 4) * 3 : 0;
  const spin = moving ? frame * 6 : 0;
  const bedY = -r * 1.9;
  const len = s * 0.95;
  const chest = (cx: number, w: number, h: number, i: number) => (
    <g key={i}>
      <rect x={f2(cx - w / 2)} y={f2(bedY - h)} width={f2(w)} height={f2(h)} rx={6} fill={d.wood} stroke={edge(d.wood)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w / 2)} y={f2(bedY - h * 0.62)} width={f2(w)} height={f2(h * 0.14)} fill={pal.accent} />
      <rect x={f2(cx - w * 0.08)} y={f2(bedY - h * 0.7)} width={f2(w * 0.16)} height={f2(h * 0.28)} fill={lighten(pal.accent, 0.2)} stroke={darken(pal.accent, 0.3)} strokeWidth={2} />
    </g>
  );
  return (
    <g transform={`translate(${f2(x)} ${f2(base + sink + bob)}) rotate(${f2(tilt)}) ${flipAt(part.flip, 0) ?? ""}`}>
      <line x1={f2(len * 0.45)} y1={f2(bedY + 10)} x2={f2(len * 0.95)} y2={f2(bedY + 30)} stroke={darken(d.wood, 0.2)} strokeWidth={10} strokeLinecap="round" />
      {chest(-len * 0.22, s * 0.3, s * 0.2, 0)}
      {chest(len * 0.12, s * 0.24, s * 0.16, 1)}
      <ellipse cx={f2(len * 0.32)} cy={f2(bedY - s * 0.07)} rx={f2(s * 0.09)} ry={f2(s * 0.08)} fill={mix(pal.floor, pal.wallA, 0.3)} stroke={edge(pal.floor)} strokeWidth={SET_LINE} />
      <rect x={f2(-len / 2)} y={f2(bedY)} width={f2(len)} height={f2(r * 0.55)} rx={6} fill={darken(d.wood, 0.08)} stroke={edge(d.wood)} strokeWidth={SET_LINE} />
      {[-0.42, 0.42].map((k) => (
        <rect key={k} x={f2(len * k - 4)} y={f2(bedY - s * 0.18)} width={8} height={f2(s * 0.18)} fill={darken(d.wood, 0.15)} />
      ))}
      <Wheel x={-len * 0.18} y={-r} r={r} spin={spin} wood={d.wood} />
      <Wheel x={len * 0.3} y={-r} r={r} spin={spin + 20} wood={d.wood} />
    </g>
  );
};

/** A draught horse in profile, facing +x. Variants: `walk` (leg cycle, head nod), `stand`, `strain` (leaning into the harness, head low). */
export const Horse: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks, frame = 0 }) => {
  const x = partX(part, W, marks, 0.7);
  const base = partBase(part, H, groundY);
  const s = part.size * fig;
  const coat = darken(mix(pal.floor, pal.accent, 0.3), 0.05);
  const v = part.variant ?? "walk";
  const k = v === "walk" ? frame / 5 : v === "strain" ? frame / 3 : 0;
  const leg = (lx: number, ph: number, front: boolean) => {
    const a = Math.sin(k + ph) * (v === "stand" ? 0 : 18);
    return (
      <g key={`${lx}${ph}`} transform={`translate(${f2(lx)} ${f2(-s * 0.42)}) rotate(${f2(a)})`}>
        <rect x={-s * 0.03} y={0} width={s * 0.06} height={s * 0.42} rx={s * 0.03} fill={front ? coat : darken(coat, 0.15)} stroke={edge(coat, 0.3)} strokeWidth={SET_LINE} />
        <rect x={-s * 0.04} y={s * 0.38} width={s * 0.08} height={s * 0.05} rx={4} fill={pal.shade} />
      </g>
    );
  };
  const nod = Math.sin(k * 2) * (v === "stand" ? 1 : 4) + (v === "strain" ? 14 : 0);
  return (
    <g transform={`translate(${f2(x)} ${f2(base)}) ${flipAt(part.flip, 0) ?? ""}`}>
      {leg(-s * 0.28, Math.PI, false)}
      {leg(s * 0.2, 0, false)}
      <ellipse cx={0} cy={f2(-s * 0.5)} rx={f2(s * 0.36)} ry={f2(s * 0.15)} fill={coat} stroke={edge(coat, 0.3)} strokeWidth={SET_LINE} />
      <path d={`M${f2(-s * 0.34)},${f2(-s * 0.56)} q${f2(-s * 0.12)},${f2(s * 0.05)} ${f2(-s * 0.1)},${f2(s * 0.24)}`} stroke={pal.shade} strokeWidth={10} fill="none" strokeLinecap="round" />
      <g transform={`translate(${f2(s * 0.3)} ${f2(-s * 0.58)}) rotate(${f2(nod)})`}>
        <path d={`M0,0 L${f2(s * 0.14)},${f2(-s * 0.26)} L${f2(s * 0.3)},${f2(-s * 0.18)} L${f2(s * 0.3)},${f2(-s * 0.1)} L${f2(s * 0.12)},${f2(s * 0.06)} Z`} fill={coat} stroke={edge(coat, 0.3)} strokeWidth={SET_LINE} strokeLinejoin="round" />
        <path d={`M${f2(s * 0.02)},${f2(-s * 0.02)} L${f2(s * 0.13)},${f2(-s * 0.27)}`} stroke={pal.shade} strokeWidth={9} strokeLinecap="round" />
        <circle cx={f2(s * 0.2)} cy={f2(-s * 0.19)} r={4} fill={pal.shade} />
      </g>
      {leg(-s * 0.2, 0, true)}
      {leg(s * 0.28, Math.PI, true)}
      <path d={`M${f2(-s * 0.1)},${f2(-s * 0.64)} q${f2(s * 0.15)},${f2(s * 0.12)} ${f2(s * 0.32)},0`} stroke={darken(pal.accent, 0.3)} strokeWidth={8} fill="none" />
    </g>
  );
};

/** A stone hall: block walls, two arched windows, red banners, flickering torches, flagstone floor. */
export const CastleHall: PartComponent = ({ palette: pal, W, H, groundY, frame = 0 }) => {
  const stone = pal.wallA;
  const torch = (tx: number, i: number) => {
    const f = 0.85 + 0.15 * noise("torch", `${i}`, frame / 6);
    return (
      <g key={i}>
        <ellipse cx={tx} cy={groundY - H * 0.33} rx={W * 0.22 * f} ry={H * 0.16 * f} fill={pal.glow ?? pal.accent} opacity={0.12} />
        <rect x={tx - 8} y={groundY - H * 0.3} width={16} height={60} fill={darken(pal.floor, 0.3)} />
        <path d={`M${tx - 16},${groundY - H * 0.3} Q${tx},${groundY - H * 0.3 - 70 * f} ${tx + 16},${groundY - H * 0.3} Z`} fill={pal.accent} />
        <path d={`M${tx - 8},${groundY - H * 0.3} Q${tx},${groundY - H * 0.3 - 40 * f} ${tx + 8},${groundY - H * 0.3} Z`} fill={pal.glow ?? lighten(pal.accent, 0.4)} />
      </g>
    );
  };
  return (
    <g>
      <rect width={W} height={H} fill={stone} />
      {Array.from({ length: 30 }, (_, r) =>
        Array.from({ length: 7 }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * (W / 6) - (r % 2) * (W / 12)} y={r * 52} width={W / 6 - 6} height={46} fill={r % 3 === c % 2 ? lighten(stone, 0.04) : darken(stone, 0.04)} />
        )),
      )}
      {[0.28, 0.72].map((k) => (
        <path key={k} d={`M${W * k - 60},${groundY - H * 0.3} V${groundY - H * 0.5} A60,60 0 0 1 ${W * k + 60},${groundY - H * 0.5} V${groundY - H * 0.3} Z`} fill={darken(pal.sky, 0.35)} stroke={pal.shade} strokeWidth={10} />
      ))}
      {[0.1, 0.9].map((k) => (
        <path key={k} d={`M${W * k - 55},${groundY - H * 0.62} H${W * k + 55} V${groundY - H * 0.36} L${W * k},${groundY - H * 0.4} L${W * k - 55},${groundY - H * 0.36} Z`} fill={pal.detail} stroke={darken(pal.detail, 0.3)} strokeWidth={4} />
      ))}
      {torch(W * 0.5, 0)}
      <rect y={groundY - 30} width={W} height={H - groundY + 30} fill={pal.floor} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={i * (W / 7)} x2={i * (W / 7) - 60} y1={groundY - 30} y2={H} stroke={darken(pal.floor, 0.15)} strokeWidth={4} />
      ))}
      <rect width={W} height={H} fill={pal.shade} opacity={0.18} />
    </g>
  );
};

/** A crown alone on a dark ground with a pale halo (for "was it lost?" beats). */
export const CrownRelic: PartComponent = ({ part, palette: pal, W, H, frame = 0 }) => {
  if (part.variant === "empty") return <rect width={W} height={H} fill={darken(pal.shade, 0.5)} />;
  const cy = H * 0.42 + Math.sin(frame / 20) * 10;
  const g = pal.accent;
  return (
    <g>
      <rect width={W} height={H} fill={pal.shade} />
      <circle cx={W / 2} cy={cy} r={W * 0.35} fill={pal.glow ?? g} opacity={0.1} />
      <g transform={`translate(${W / 2} ${cy})`}>
        <path d="M-170,60 L-170,-60 L-90,10 L0,-110 L90,10 L170,-60 L170,60 Z" fill={g} stroke={darken(g, 0.4)} strokeWidth={10} strokeLinejoin="round" />
        <rect x={-170} y={30} width={340} height={40} fill={darken(g, 0.15)} stroke={darken(g, 0.4)} strokeWidth={8} />
        {[-100, 0, 100].map((cx, i) => (
          <circle key={cx} cx={cx} cy={50} r={14} fill={i === 1 ? mix(pal.sky, pal.shade, 0.1) : pal.detail} />
        ))}
      </g>
    </g>
  );
};
