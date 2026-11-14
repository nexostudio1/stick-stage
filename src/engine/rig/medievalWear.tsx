import React from "react";
import { darken, lighten } from "../lib/color";
import { f2 } from "../lib/math";
import { onHead, torsoFrame, torsoWidthPx, type AccessoryDef, type AccessoryDraw } from "./accessoryKit";

/**
 * Medieval wear for the stick tier: crown, kettle hat, hood, tunic, mail and cape. Head pieces are
 * head-local (radius R, facing +x); body pieces use the torso frame (origin at the hip, torso up).
 */
const pts = (xs: [number, number][]) => xs.map(([x, y]) => `${f2(x)},${f2(y)}`).join(" ");

/** Draws in the torso frame, or nothing when the body anchor is missing. */
const onTorso =
  (draw: (a: { T: number; w: number; stroke: string; sw: number; color: string }) => React.ReactNode, minW = 0.1): AccessoryDraw =>
  ({ stroke, sw, color, character, hip, neck, heightPx: H }) => {
    if (!hip || !neck || H == null) return null;
    const { len: T, angle } = torsoFrame(hip, neck);
    const w = Math.max(torsoWidthPx(character, H), H * minW);
    return <g transform={`translate(${f2(hip.x)} ${f2(hip.y)}) rotate(${f2(angle)})`}>{draw({ T, w, stroke, sw, color })}</g>;
  };

export const MEDIEVAL_WEAR: Record<string, AccessoryDef> = {
  /** A plain gold crown: a band with five points and three stones. */
  "crown-01": {
    slot: "headwear",
    layers: {
      front: ({ R, stroke, sw, color }) => {
        const a = onHead(R, -62, 1);
        const b = onHead(R, 70, 1);
        const top = -R * 1.42;
        const xs = [0, 0.25, 0.5, 0.75, 1].map((k) => a.x + (b.x - a.x) * k);
        const d = `M ${f2(a.x)} ${f2(a.y)} L ${xs.map((x, i) => `${f2(x)} ${f2(i % 2 === 0 ? top : a.y - R * 0.22)}`).join(" L ")} L ${f2(b.x)} ${f2(b.y)} Z`;
        return (
          <g strokeLinejoin="round">
            <path d={d} fill={color} stroke={stroke} strokeWidth={sw} />
            <rect x={a.x} y={a.y - R * 0.16} width={b.x - a.x} height={R * 0.2} fill={darken(color, 0.12)} stroke={stroke} strokeWidth={sw * 0.7} />
            {[0.2, 0.5, 0.8].map((k, i) => (
              <circle key={k} cx={a.x + (b.x - a.x) * k} cy={a.y - R * 0.06} r={R * 0.07} fill={["#c0392b", "#2e86c1", "#c0392b"][i]} stroke={stroke} strokeWidth={sw * 0.35} />
            ))}
          </g>
        );
      },
    },
  },
  /** An iron kettle hat: round crown and a wide, slightly drooping brim. */
  "kettle-hat": {
    slot: "headwear",
    layers: {
      front: ({ R, stroke, sw, color }) => {
        const brimY = -R * 0.42;
        const dome = `M ${f2(-R * 0.92)} ${f2(brimY)} C ${f2(-R * 0.95)} ${f2(-R * 1.45)} ${f2(R * 0.98)} ${f2(-R * 1.45)} ${f2(R * 0.95)} ${f2(brimY)} Z`;
        const brim = `M ${f2(-R * 1.42)} ${f2(brimY + R * 0.18)} Q ${f2(0)} ${f2(brimY - R * 0.16)} ${f2(R * 1.48)} ${f2(brimY + R * 0.18)} Q ${f2(0)} ${f2(brimY + R * 0.02)} ${f2(-R * 1.42)} ${f2(brimY + R * 0.18)} Z`;
        return (
          <g strokeLinejoin="round">
            <path d={dome} fill={color} stroke={stroke} strokeWidth={sw} />
            <path d={`M ${f2(0)} ${f2(-R * 1.3)} L ${f2(0)} ${f2(brimY)}`} stroke={darken(color, 0.25)} strokeWidth={sw * 0.5} />
            <path d={brim} fill={darken(color, 0.1)} stroke={stroke} strokeWidth={sw} />
            <path d={`M ${f2(-R * 0.5)} ${f2(-R * 1.1)} Q ${f2(-R * 0.2)} ${f2(-R * 1.28)} ${f2(R * 0.2)} ${f2(-R * 1.24)}`} stroke={lighten(color, 0.35)} strokeWidth={sw * 0.45} fill="none" strokeLinecap="round" />
          </g>
        );
      },
    },
  },
  /** A cloth hood with the face open: back of the head covered, a rim around the face. */
  "hood-01": {
    slot: "headwear",
    layers: {
      back: ({ R, stroke, sw, color }) => (
        <path
          d={`M ${f2(R * 0.55)} ${f2(-R * 1.0)} C ${f2(-R * 0.6)} ${f2(-R * 1.55)} ${f2(-R * 1.55)} ${f2(-R * 0.4)} ${f2(-R * 1.2)} ${f2(R * 0.7)} L ${f2(-R * 0.9)} ${f2(R * 1.45)} L ${f2(R * 0.5)} ${f2(R * 1.35)} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ),
      front: ({ R, stroke, sw, color }) => {
        const a = onHead(R, -75, 1.06);
        const b = onHead(R, 52, 1.06);
        return <path d={`M ${f2(a.x)} ${f2(a.y)} A ${f2(R * 1.06)} ${f2(R * 1.06)} 0 0 1 ${f2(b.x)} ${f2(b.y)} Q ${f2(R * 0.4)} ${f2(-R * 1.25)} ${f2(-R * 0.3)} ${f2(-R * 1.18)} Q ${f2(-R * 0.85)} ${f2(-R * 1.0)} ${f2(a.x)} ${f2(a.y)} Z`} fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
      },
    },
  },
  /** A belted knee-length tunic over the torso. */
  "tunic-01": {
    slot: "body",
    layers: {
      belly: onTorso(({ T, w, stroke, sw, color }) => (
        <g strokeLinejoin="round">
          <polygon points={pts([[-w * 0.62, -T * 0.98], [w * 0.62, -T * 0.98], [w * 0.95, T * 0.5], [-w * 0.95, T * 0.5]])} fill={color} stroke={stroke} strokeWidth={sw} />
          <rect x={-w * 0.7} y={-T * 0.12} width={w * 1.4} height={T * 0.1} fill={darken(color, 0.35)} stroke={stroke} strokeWidth={sw * 0.5} />
        </g>
      )),
    },
  },
  /** A mail shirt: grey with a ring texture and a cloth surcoat stripe. */
  "mail-01": {
    slot: "body",
    layers: {
      belly: onTorso(({ T, w, stroke, sw, color }) => (
        <g strokeLinejoin="round">
          <polygon points={pts([[-w * 0.66, -T * 0.98], [w * 0.66, -T * 0.98], [w * 0.9, T * 0.42], [-w * 0.9, T * 0.42]])} fill="#9aa3ad" stroke={stroke} strokeWidth={sw} />
          {Array.from({ length: 6 }, (_, r) => (
            <path key={r} d={`M ${f2(-w * 0.6)} ${f2(-T * 0.85 + r * T * 0.2)} q ${f2(w * 0.15)} ${f2(T * 0.06)} ${f2(w * 0.3)} 0 t ${f2(w * 0.3)} 0 t ${f2(w * 0.3)} 0 t ${f2(w * 0.3)} 0`} fill="none" stroke="#6f7881" strokeWidth={sw * 0.3} />
          ))}
          <polygon points={pts([[-w * 0.28, -T * 0.7], [w * 0.28, -T * 0.7], [w * 0.36, T * 0.42], [-w * 0.36, T * 0.42]])} fill={color} stroke={stroke} strokeWidth={sw * 0.7} />
        </g>
      )),
    },
  },
  /** A long royal cape behind the body, with a fur collar. */
  "cape-01": {
    slot: "body",
    layers: {
      body: onTorso(({ T, w, stroke, sw, color }) => (
        <g strokeLinejoin="round">
          <polygon points={pts([[-w * 0.7, -T * 1.0], [w * 0.7, -T * 1.0], [w * 1.25, T * 1.55], [-w * 1.45, T * 1.6]])} fill={color} stroke={stroke} strokeWidth={sw} />
          <ellipse cx={0} cy={-T * 0.98} rx={w * 0.85} ry={T * 0.13} fill="#f4efe6" stroke={stroke} strokeWidth={sw * 0.8} />
        </g>
      ), 0.12),
    },
  },
};
