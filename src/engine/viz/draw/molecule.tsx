/** A handed molecule and its mirror twin: `molecule`. */
import React from "react";
import { clamp, f2 } from "../../lib/math";
import { lighten } from "../../lib/color";
import type { MoleculeP } from "../params";
import { resolveColor } from "../theme";
import { Txt, type DrawProps } from "./common";

type V3 = { x: number; y: number; z: number };
const RAD = Math.PI / 180;
// Tetrahedron: one group straight up, three below at 120° apart.
const DOWN = -1 / 3;
const SIDE = Math.sqrt(8 / 9);
const CORNERS: readonly V3[] = [
  { x: 0, y: 1, z: 0 },
  ...[0, 120, 240].map((a) => ({
    x: SIDE * Math.cos((a + 90) * RAD),
    y: DOWN,
    z: SIDE * Math.sin((a + 90) * RAD),
  })),
];

/** Corner positions after the mirror flip (x scaled 1 → −1), the turn and the tilt. */
const place = (mirror: number, turn: number, tilt: number): V3[] => {
  const sx = 1 - 2 * mirror;
  const cy = Math.cos(turn * RAD);
  const sy = Math.sin(turn * RAD);
  const ct = Math.cos(tilt * RAD);
  const st = Math.sin(tilt * RAD);
  return CORNERS.map((c) => {
    const x0 = c.x * sx;
    const x = x0 * cy + c.z * sy;
    const z = -x0 * sy + c.z * cy;
    return { x, y: c.y * ct - z * st, z: c.y * st + z * ct };
  });
};

type Atom = { x: number; y: number; z: number; r: number; color: string; group: number };

const Ball: React.FC<{ a: Atom; ink: string; sw: number; opacity: number }> = ({
  a,
  ink,
  sw,
  opacity,
}) => (
  <g opacity={opacity}>
    <circle cx={f2(a.x)} cy={f2(a.y)} r={f2(a.r)} fill={a.color} stroke={ink} strokeWidth={sw} />
    <circle
      cx={f2(a.x - a.r * 0.32)}
      cy={f2(a.y - a.r * 0.34)}
      r={f2(a.r * 0.3)}
      fill={lighten(a.color, 0.55)}
      opacity={0.8}
    />
  </g>
);

/** One molecule at (cx, cy) with bond length `s`: bonds and balls back to front. */
const atomsOf = (pts: V3[], cx: number, cy: number, s: number, colors: string[]): Atom[] =>
  pts.map((q, i) => ({
    x: cx + q.x * s,
    y: cy - q.y * s,
    z: q.z,
    r: s * (0.3 + 0.05 * q.z),
    color: colors[i]!,
    group: i,
  }));

const Molecule: React.FC<{
  atoms: Atom[];
  cx: number;
  cy: number;
  s: number;
  ink: string;
  centre: string;
  sw: number;
  opacity: number;
}> = ({ atoms, cx, cy, s, ink, centre, sw, opacity }) => {
  const back = atoms.filter((a) => a.z < 0).sort((a, b) => a.z - b.z);
  const front = atoms.filter((a) => a.z >= 0).sort((a, b) => a.z - b.z);
  const bond = (a: Atom) => (
    <line
      key={`b${a.group}`}
      x1={f2(cx)}
      y1={f2(cy)}
      x2={f2(a.x)}
      y2={f2(a.y)}
      stroke={ink}
      strokeWidth={sw * 2.4}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
  return (
    <g>
      {back.map(bond)}
      {back.map((a) => (
        <Ball key={a.group} a={a} ink={ink} sw={sw} opacity={opacity} />
      ))}
      <circle
        cx={f2(cx)}
        cy={f2(cy)}
        r={f2(s * 0.22)}
        fill={centre}
        stroke={ink}
        strokeWidth={sw}
        opacity={opacity}
      />
      {front.map(bond)}
      {front.map((a) => (
        <Ball key={a.group} a={a} ink={ink} sw={sw} opacity={opacity} />
      ))}
    </g>
  );
};

export const MoleculeFig: React.FC<DrawProps<MoleculeP>> = ({
  p,
  w,
  h,
  theme,
  t,
  reveal,
  fontFamily,
  unit,
}) => {
  const ink = theme.dark ? theme.paper : theme.ink;
  const line = theme.ink;
  const sw = theme.stroke * unit * 0.5;
  const colors = p.groups.map((c) => resolveColor(theme, c));
  const centre = theme.dark ? "#3a3f4a" : "#55555e";
  const labelSpace = p.label || p.twinLabel ? 0.18 : 0;
  const cy = h * (0.5 - labelSpace / 2);
  const s = Math.min(p.pair ? w / 4.6 : w / 2.6, (h * (1 - labelSpace)) / 2.7);
  const turn = p.turn + p.spin * t;
  const pop = clamp(reveal * 1.4, 0, 1);
  const ox = p.pair ? w * 0.27 : w / 2;
  const own = atomsOf(place(p.mirror, turn, p.tilt), ox, cy, s * pop, colors);
  const lsz = Math.min(h * 0.11, w * 0.06);
  if (!p.pair)
    return (
      <g>
        <Molecule
          atoms={own}
          cx={ox}
          cy={cy}
          s={s * pop}
          ink={ink}
          centre={centre}
          sw={sw}
          opacity={1}
        />
        {p.label ? (
          <Txt
            x={w / 2}
            y={h - lsz}
            size={lsz}
            color={line}
            halo={theme.paper}
            fontFamily={fontFamily}
          >
            {p.label}
          </Txt>
        ) : null}
      </g>
    );
  // The twin is the reflection across the mirror line: mirrored shape, turned the opposite way.
  const tx = w * 0.73 + (ox - w * 0.73) * p.match;
  const twin = atomsOf(place(1 - p.mirror, -turn + p.twinTurn, p.tilt), tx, cy, s * pop, colors);
  const tw = p.twin * pop;
  const rings =
    p.match > 0.92
      ? own
          .map((a) => {
            const near = twin.reduce((b, c) =>
              Math.hypot(c.x - a.x, c.y - a.y) < Math.hypot(b.x - a.x, b.y - a.y) ? c : b,
            );
            return near.group === a.group ? null : a;
          })
          .filter((a): a is Atom => a !== null)
      : [];
  const ringOn = clamp((p.match - 0.92) / 0.08, 0, 1);
  return (
    <g>
      <line
        x1={f2(w / 2)}
        y1={f2(h * 0.04)}
        x2={f2(w / 2)}
        y2={f2(h * (0.96 - labelSpace))}
        stroke={theme.muted}
        strokeWidth={sw * 1.6}
        strokeDasharray={`${f2(sw * 5)} ${f2(sw * 4)}`}
        opacity={tw * (1 - p.match)}
      />
      <Molecule
        atoms={own}
        cx={ox}
        cy={cy}
        s={s * pop}
        ink={ink}
        centre={centre}
        sw={sw}
        opacity={1}
      />
      <Molecule
        atoms={twin}
        cx={tx}
        cy={cy}
        s={s * pop}
        ink={ink}
        centre={centre}
        sw={sw}
        opacity={tw * (1 - 0.35 * p.match)}
      />
      {rings.map((a) => (
        <circle
          key={a.group}
          cx={f2(a.x)}
          cy={f2(a.y)}
          r={f2(a.r * 1.45)}
          fill="none"
          stroke={theme.myth}
          strokeWidth={sw * 2.2}
          opacity={ringOn}
        />
      ))}
      {p.label ? (
        <Txt
          x={w * 0.27}
          y={h - lsz}
          size={lsz}
          color={line}
          halo={theme.paper}
          fontFamily={fontFamily}
        >
          {p.label}
        </Txt>
      ) : null}
      {p.twinLabel ? (
        <Txt
          x={w * 0.73}
          y={h - lsz}
          size={lsz}
          color={line}
          halo={theme.paper}
          fontFamily={fontFamily}
          opacity={tw * (1 - p.match)}
        >
          {p.twinLabel}
        </Txt>
      ) : null}
    </g>
  );
};
