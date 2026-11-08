/** More night-kit backdrops (see `night.tsx`): card vault, ledger desk, lost and found, evidence wall. */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import { backWall, Lamp, Room } from "./night";
import type { PartComponent } from "./types";

/** A cavern of gift cards: walls of stacked cards in the dark, a stone ledge, cones from high above. */
export const CardVault: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const cards = [pal.detail, mix(pal.accent, pal.wallA, 0.55), mix(pal.sky, pal.wallA, 0.2), darken(pal.detail, 0.2)];
  const t = frame / 30;
  const wall = (x0: number, x1: number, seed: string) =>
    Array.from({ length: 140 }, (_, i) => {
      const x = x0 + rand(seed, `x${i}`) * (x1 - x0);
      const y = H * 0.05 + rand(seed, `y${i}`) * H * 0.7;
      const r = (rand(seed, `r${i}`) - 0.5) * 70;
      const k = 0.6 + rand(seed, `k${i}`) * 0.8;
      const twinkle = i % 23 === 0 ? 0.5 + 0.5 * Math.max(0, noise(seed, `t${i}`, t * 0.8)) : 0;
      return <rect key={i} x={f2(x - 30 * k)} y={f2(y - 19 * k)} width={f2(60 * k)} height={f2(38 * k)} rx={f2(5 * k)} fill={twinkle ? mix(cards[i % 4]!, pal.accent, twinkle) : cards[i % 4]} opacity={0.35 + 0.4 * rand(seed, `o${i}`)} transform={`rotate(${f2(r)} ${f2(x)} ${f2(y)})`} />;
    });
  return (
    <g>
      <rect width={W} height={H} fill={pal.shade} />
      <ellipse cx={W / 2} cy={H * 0.35} rx={W * 0.42} ry={H * 0.45} fill={pal.wallA} />
      {wall(0, W * 0.32, "vault-l")}
      {wall(W * 0.68, W, "vault-r")}
      {wall(W * 0.3, W * 0.7, "vault-c").slice(0, 50)}
      <path d={`M0,${f2(H * 0.78)} Q${W / 2},${f2(H * 0.7)} ${W},${f2(H * 0.78)} L${W},${H} L0,${H}Z`} fill={pal.floor} />
      <path d={`M0,${f2(H * 0.78)} Q${W / 2},${f2(H * 0.7)} ${W},${f2(H * 0.78)}`} fill="none" stroke={lighten(pal.floor, 0.12)} strokeWidth={6} />
      <Lamp pal={pal} x={W * 0.5} y={-20} floorY={H * 0.76} spread={W * 0.2} frame={frame} seed="vault" strength={0.8} />
    </g>
  );
};

/** Top-down onto a back-office desk: wood boards, a lamp pool, a coffee ring, a pencil. */
export const LedgerDesk: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const wood = mix(pal.floor, pal.accent, 0.12);
  const glow = pal.glow ?? pal.accent;
  const flick = 0.92 + 0.08 * noise("desk", "f", (frame / 30) * 2);
  return (
    <g>
      <rect width={W} height={H} fill={wood} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={0} y={f2((H / 9) * i)} width={W} height={2} fill={darken(wood, 0.25)} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <path key={`g${i}`} d={`M${f2(rand("grain", i) * W)},${f2(rand("grain", `y${i}`) * H)} q${f2(60 + rand("grain", `l${i}`) * 120)},6 ${f2(200 + rand("grain", `m${i}`) * 200)},0`} fill="none" stroke={lighten(wood, 0.06)} strokeWidth={2} />
      ))}
      <ellipse cx={W * 0.5} cy={H * 0.48} rx={W * 0.42} ry={H * 0.46} fill={glow} opacity={0.16 * flick} />
      <ellipse cx={W * 0.5} cy={H * 0.48} rx={W * 0.26} ry={H * 0.3} fill={glow} opacity={0.1 * flick} />
      <circle cx={W * 0.86} cy={H * 0.2} r={H * 0.07} fill="none" stroke={darken(wood, 0.3)} strokeWidth={6} opacity={0.5} />
      <rect x={W * 0.08} y={H * 0.78} width={W * 0.16} height={12} rx={6} fill={mix(pal.accent, wood, 0.3)} transform={`rotate(-14 ${W * 0.16} ${H * 0.78})`} />
    </g>
  );
};

/** Lost and found: a back room of shelves with boxes and bags, a hand-lettered sign, one bare bulb. */
export const LostAndFound: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const b = backWall(W, H, 0.7, 0.62, 0.74);
  const bw = b.x1 - b.x0;
  const shelfYs = [0.3, 0.62].map((k) => b.y0 + (b.y1 - b.y0) * k);
  const boxes = [pal.detail, mix(pal.floor, pal.accent, 0.25), darken(pal.detail, 0.2), mix(pal.sky, pal.wallA, 0.4)];
  return (
    <g>
      <Room pal={pal} W={W} H={H} b={b} />
      {shelfYs.map((y, s) => (
        <g key={s}>
          {Array.from({ length: 7 }, (_, i) => {
            const w = bw * (0.07 + 0.05 * rand("lf", `${s}w${i}`));
            const h = (b.y1 - b.y0) * (0.12 + 0.12 * rand("lf", `${s}h${i}`));
            const x = b.x0 + 20 + (i / 7) * (bw - 40);
            return <rect key={i} x={f2(x)} y={f2(y - h)} width={f2(w)} height={f2(h)} rx={6} fill={boxes[(i + s) % 4]} />;
          })}
          <rect x={f2(b.x0)} y={f2(y)} width={f2(bw)} height={14} fill={darken(pal.detail, 0.15)} />
        </g>
      ))}
      <g transform={`translate(${f2(W / 2)} ${f2(b.y0 + 34)}) rotate(-2)`}>
        <rect x={-150} y={-26} width={300} height={52} rx={6} fill={mix(pal.accent, pal.wallA, 0.25)} />
        <text y={12} textAnchor="middle" fontFamily="Catch Mono" fontWeight={600} fontSize={30} letterSpacing={4} fill={pal.wallA}>
          LOST + FOUND
        </text>
      </g>
      <Lamp pal={pal} x={W * 0.5} y={H * 0.1} floorY={H * 0.9} spread={W * 0.22} frame={frame} seed="lost" />
    </g>
  );
};

/** A cork evidence wall filling the frame, lit from a desk lamp below; pins and string come from the `evidence` figure. */
export const EvidenceWall: PartComponent = ({ palette: pal, W, H, frame = 0 }) => {
  const cork = mix(pal.accent, pal.wallA, 0.62);
  const glow = pal.glow ?? pal.accent;
  const flick = 0.92 + 0.08 * noise("board", "f", (frame / 30) * 2);
  return (
    <g>
      <rect width={W} height={H} fill={darken(pal.wallA, 0.1)} />
      <rect x={W * 0.04} y={H * 0.06} width={W * 0.92} height={H * 0.84} rx={10} fill={cork} stroke={darken(cork, 0.35)} strokeWidth={16} />
      {Array.from({ length: 260 }, (_, i) => (
        <circle key={i} cx={f2(W * 0.05 + rand("cork", `x${i}`) * W * 0.9)} cy={f2(H * 0.07 + rand("cork", `y${i}`) * H * 0.82)} r={f2(1.5 + rand("cork", `r${i}`) * 2.5)} fill={darken(cork, 0.25)} opacity={0.6} />
      ))}
      {[0.12, 0.8].map((k, i) => (
        <rect key={i} x={f2(W * k)} y={f2(H * (0.14 + i * 0.6))} width={W * 0.08} height={H * 0.1} fill={mix(pal.wallA, cork, 0.5)} opacity={0.6} transform={`rotate(${i ? 6 : -5} ${f2(W * k)} ${f2(H * 0.2)})`} />
      ))}
      <ellipse cx={W * 0.5} cy={H * 1.02} rx={W * 0.55} ry={H * 0.75} fill={glow} opacity={0.14 * flick} />
      <rect width={W} height={H} fill={pal.wallA} opacity={0.18} />
    </g>
  );
};
