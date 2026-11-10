import React from "react";
import { f2 } from "../lib/math";
import { onHead, type AccessoryDef } from "./accessoryKit";

/**
 * Hair and headwear for the relatable four-person channel's cast (`four-*` characters). Head-local,
 * stick build. Only `four-*` characters use these ids, so no other cast changes.
 */

/** Points along the head outline from `from`° to `to`° at radius `k`, with an optional bump every other point. */
const arc = (R: number, from: number, to: number, n: number, k: number, bump = 0): string[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const p = onHead(R, from + ((to - from) * i) / n, k + (i % 2 ? bump : 0));
    return `${f2(p.x)},${f2(p.y)}`;
  });

export const FOUR_WEAR: Record<string, AccessoryDef> = {
  /** Mitch: a baseball cap worn backwards, the brim sticking out behind. */
  "four-cap-back": {
    slot: "headwear",
    layers: {
      front: ({ R, stroke, sw, color }) => {
        const a = onHead(R, -104, 1.04);
        const b = onHead(R, 84, 1.04);
        const dome = `M ${f2(a.x)} ${f2(a.y)} A ${f2(R * 1.04)} ${f2(R * 1.04)} 0 0 1 ${f2(b.x)} ${f2(b.y)} Q ${f2(0)} ${f2(-R * 0.18)} ${f2(a.x)} ${f2(a.y)} Z`;
        const brim = `M ${f2(a.x + R * 0.1)} ${f2(a.y - R * 0.06)} L ${f2(a.x - R * 0.5)} ${f2(a.y + R * 0.02)} Q ${f2(a.x - R * 0.56)} ${f2(a.y + R * 0.16)} ${f2(a.x - R * 0.4)} ${f2(a.y + R * 0.18)} L ${f2(a.x + R * 0.08)} ${f2(a.y + R * 0.12)} Z`;
        const top = onHead(R, -8, 1.05);
        return (
          <g strokeLinejoin="round">
            <path d={brim} fill={color} stroke={stroke} strokeWidth={sw} />
            <path d={dome} fill={color} stroke={stroke} strokeWidth={sw} />
            <circle cx={f2(top.x)} cy={f2(top.y)} r={f2(R * 0.08)} fill={color} stroke={stroke} strokeWidth={sw * 0.7} />
          </g>
        );
      },
    },
  },
  /** Ollie: a messy mop, bumpy all round the crown with a fringe falling forward. */
  "four-mop": {
    slot: "hair",
    layers: {
      front: ({ R, stroke, sw, color }) => {
        const outer = arc(R, -112, 66, 12, 1.12, 0.12);
        const inner = arc(R, -112, 66, 6, 0.78).reverse();
        const fringe = onHead(R, 60, 0.62);
        const tip = onHead(R, 72, 1.1);
        return (
          <g strokeLinejoin="round">
            <polygon points={[...outer, `${f2(tip.x)},${f2(tip.y)}`, `${f2(fringe.x)},${f2(fringe.y)}`, ...inner].join(" ")} fill={color} stroke={stroke} strokeWidth={sw} />
          </g>
        );
      },
    },
  },
  /** Mei: a sleek jaw-length bob with a blunt fringe. */
  "four-bob": {
    slot: "hair",
    layers: {
      back: ({ R, stroke, sw, color }) => (
        <path
          d={`M ${f2(-R * 1.14)} ${f2(R * 0.1)} Q ${f2(-R * 1.22)} ${f2(-R * 1.25)} ${f2(0)} ${f2(-R * 1.16)} Q ${f2(R * 1.22)} ${f2(-R * 1.25)} ${f2(R * 1.14)} ${f2(R * 0.1)} L ${f2(R * 1.1)} ${f2(R * 0.72)} L ${f2(-R * 1.1)} ${f2(R * 0.72)} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ),
      front: ({ R, stroke, sw, color }) => {
        const a = onHead(R, -96, 1.06);
        const b = onHead(R, 96, 1.06);
        const d = `M ${f2(a.x)} ${f2(a.y)} A ${f2(R * 1.06)} ${f2(R * 1.06)} 0 0 1 ${f2(b.x)} ${f2(b.y)} L ${f2(R * 0.9)} ${f2(-R * 0.36)} L ${f2(-R * 0.2)} ${f2(-R * 0.4)} Q ${f2(-R * 0.8)} ${f2(-R * 0.3)} ${f2(a.x)} ${f2(a.y)} Z`;
        return <path d={d} fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
      },
    },
  },
  /** Maya: long wavy hair past the shoulders, parted to one side. */
  "four-long": {
    slot: "hair",
    layers: {
      back: ({ R, stroke, sw, color }) => {
        const side = (s: number) =>
          `Q ${f2(s * R * 1.42)} ${f2(R * 0.5)} ${f2(s * R * 1.2)} ${f2(R * 1.0)} Q ${f2(s * R * 1.05)} ${f2(R * 1.4)} ${f2(s * R * 1.32)} ${f2(R * 1.85)}`;
        const d =
          `M ${f2(-R * 0.2)} ${f2(-R * 1.15)} Q ${f2(-R * 1.3)} ${f2(-R * 1.05)} ${f2(-R * 1.2)} ${f2(0)} ${side(-1)} ` +
          `Q ${f2(0)} ${f2(R * 2.05)} ${f2(R * 1.32)} ${f2(R * 1.85)} Q ${f2(R * 1.05)} ${f2(R * 1.4)} ${f2(R * 1.2)} ${f2(R * 1.0)} Q ${f2(R * 1.42)} ${f2(R * 0.5)} ${f2(R * 1.2)} ${f2(0)} Q ${f2(R * 1.3)} ${f2(-R * 1.05)} ${f2(-R * 0.2)} ${f2(-R * 1.15)} Z`;
        return <path d={d} fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
      },
      front: ({ R, stroke, sw, color }) => {
        const a = onHead(R, -100);
        const b = onHead(R, 80);
        const d =
          `M ${f2(a.x)} ${f2(a.y)} A ${f2(R)} ${f2(R)} 0 0 1 ${f2(b.x)} ${f2(b.y)} ` +
          `Q ${f2(R * 0.55)} ${f2(-R * 0.55)} ${f2(-R * 0.1)} ${f2(-R * 0.82)} Q ${f2(-R * 0.6)} ${f2(-R * 0.45)} ${f2(a.x)} ${f2(a.y)} Z`;
        return <path d={d} fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
      },
    },
  },
};
