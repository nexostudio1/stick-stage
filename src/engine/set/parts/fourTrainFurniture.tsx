/**
 * The `four` kit's train furniture, drawn in profile to match the cast (who are seen side-on):
 * a single seat with a tall backrest, a wall table between two facing seats, and a hanging grab
 * strap for a standing passenger. Palette tokens only (`four-train`).
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { SEAT_HEIGHT } from "./seats";
import { edge, flipAt, partBase, partX, SET_LINE, type PartComponent } from "./types";

/** Strap rail height, as a fraction of frame height (matches `FourTrainBay`). */
const RAIL_Y = 0.075;

/**
 * One seat in profile for a passenger facing right (backrest on the left); `flip: true` for one
 * facing left. Place it on the passenger's mark and list that mark in `seatFor`.
 */
export const FourTrainSeat: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const seatTop = base - SEAT_HEIGHT["four-train-seat"] * s;
  const fill = pal.detail;
  const back = { x0: cx - s * 0.2, x1: cx - s * 0.1, top: base - s * 0.78 };
  const cushion = { x0: back.x0, x1: cx + s * 0.13 };
  return (
    <g transform={flipAt(part.flip, cx)} stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      {/* Pedestal and foot. */}
      <rect x={f2(cx - s * 0.06)} y={f2(seatTop)} width={f2(s * 0.06)} height={f2(base - seatTop)} fill={mix(pal.shade, pal.wallA, 0.4)} />
      <rect x={f2(cx - s * 0.12)} y={f2(base - s * 0.02)} width={f2(s * 0.18)} height={f2(s * 0.02)} rx={4} fill={mix(pal.shade, pal.wallA, 0.3)} />
      {/* Backrest, leaning back slightly, with a white headrest cover. */}
      <path
        d={`M ${f2(back.x0 - s * 0.03)} ${f2(back.top + s * 0.04)} Q ${f2(back.x0 - s * 0.02)} ${f2(back.top)} ${f2(back.x0 + s * 0.04)} ${f2(back.top)} L ${f2(back.x1 + s * 0.01)} ${f2(back.top + s * 0.02)} L ${f2(back.x1)} ${f2(seatTop)} L ${f2(back.x0)} ${f2(seatTop)} Z`}
        fill={fill}
      />
      <rect x={f2(back.x0 - s * 0.025)} y={f2(back.top + s * 0.01)} width={f2(back.x1 - back.x0 + s * 0.03)} height={f2(s * 0.1)} rx={s * 0.03} fill={lighten(pal.wallA, 0.3)} />
      {[0.3, 0.5].map((k) => (
        <circle key={k} cx={f2((back.x0 + back.x1) / 2)} cy={f2(back.top + (seatTop - back.top) * k + s * 0.06)} r={s * 0.012} fill={lighten(fill, 0.25)} stroke="none" />
      ))}
      {/* Cushion. */}
      <rect x={f2(cushion.x0)} y={f2(seatTop - s * 0.02)} width={f2(cushion.x1 - cushion.x0)} height={f2(s * 0.07)} rx={s * 0.03} fill={lighten(fill, 0.08)} />
    </g>
  );
};

/** A small wall table between two facing seats, with two coffee cups. Drawn over the cast's knees (foreground). */
export const FourTrainTable: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const top = base - s * 0.4;
  const w = s * 0.34;
  const wood = mix(pal.wallA, pal.accent, 0.12);
  const cup = (x: number, i: number) => (
    <g key={i}>
      <rect x={f2(x - s * 0.025)} y={f2(top - s * 0.055)} width={f2(s * 0.05)} height={f2(s * 0.055)} rx={4} fill={i ? pal.accent : pal.wallB} stroke={edge(pal.wallB, 0.3)} strokeWidth={SET_LINE} />
      <rect x={f2(x - s * 0.028)} y={f2(top - s * 0.06)} width={f2(s * 0.056)} height={f2(s * 0.012)} rx={3} fill={lighten(pal.wallA, 0.2)} />
    </g>
  );
  return (
    <g>
      <rect x={f2(cx - s * 0.03)} y={f2(top)} width={f2(s * 0.06)} height={f2(base - top)} fill={mix(pal.shade, pal.wallA, 0.4)} stroke={edge(pal.shade)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w / 2)} y={f2(top)} width={f2(w)} height={f2(s * 0.04)} rx={s * 0.015} fill={wood} stroke={edge(wood, 0.25)} strokeWidth={SET_LINE} />
      {[cx - w * 0.28, cx + w * 0.28].map(cup)}
    </g>
  );
};

/** A grab strap from the ceiling rail to a loop at `y` (fraction of frame height) for a standing passenger's hand. */
export const FourTrainStrap: PartComponent = ({ part, palette: pal, W, H, fig, marks }) => {
  const x = partX(part, W, marks, 0.5);
  const railY = H * RAIL_Y;
  const loopY = (part.y ?? 0.42) * H;
  const r = fig * 0.04 * part.size;
  return (
    <g>
      <rect x={f2(x - 6)} y={f2(railY)} width={12} height={f2(loopY - r - railY)} rx={5} fill={pal.accent} />
      <circle cx={f2(x)} cy={f2(loopY)} r={f2(r)} fill="none" stroke={darken(pal.accent, 0.1)} strokeWidth={9} />
    </g>
  );
};

/** The tops of the next row of seat backs along the bottom edge (foreground), for depth in a wide shot. */
export const FourTrainNearSeats: PartComponent = ({ palette: pal, W, H }) => {
  const fill = darken(pal.detail, 0.06);
  const top = H * 0.86;
  const backs = [
    { x0: -W * 0.04, x1: W * 0.4 },
    { x0: W * 0.6, x1: W * 1.04 },
  ];
  return (
    <g stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      {backs.map((b, i) => (
        <g key={i}>
          <rect x={f2(b.x0)} y={f2(top)} width={f2(b.x1 - b.x0)} height={f2(H - top + 40)} rx={W * 0.05} fill={fill} />
          {[0.28, 0.72].map((k) => (
            <rect key={k} x={f2(b.x0 + (b.x1 - b.x0) * k - W * 0.08)} y={f2(top - H * 0.008)} width={f2(W * 0.16)} height={f2(H * 0.035)} rx={W * 0.02} fill={lighten(pal.wallA, 0.3)} />
          ))}
          {Array.from({ length: 8 }, (_, j) => (
            <circle key={j} cx={f2(b.x0 + (b.x1 - b.x0) * (0.08 + 0.12 * j))} cy={f2(top + H * (0.06 + 0.03 * (j % 2)))} r={W * 0.006} fill={lighten(fill, 0.22)} stroke="none" />
          ))}
        </g>
      ))}
    </g>
  );
};
