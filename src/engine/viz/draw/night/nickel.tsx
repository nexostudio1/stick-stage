/**
 * Nickel, The Catch's host: an original raccoon in an ember hoodie with a headlamp (design B,
 * `../planning/2026-10-30-the-catch/frames/nickel.html`). Drawn as SVG markup from the design
 * sheet's part functions so the puppet matches the approved drawing, with the expression, pose,
 * blink, talk and headlamp as data. Native units: feet at y = 0, about 620 tall.
 */
import React, { useId } from "react";
import { f2 } from "../../../lib/math";
import { noise } from "../../../lib/seed";
import type { NickelP } from "../../paramsNight";
import type { DrawProps } from "../common";
import { NIGHT } from "./tokens";

const { ink: INK, fur: FUR, furDark: FUR_D, mask: MASK, cream: CREAM, sodium: SODIUM, ember: EMBER, emberDark: EMBER_D, paper: PAPER, steel: STEEL } = NIGHT;
const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

type Expr = { brow: [number, number]; tilt: [number, number]; lid: [number, number]; look: [number, number]; pupil?: number; mouth: string };
const EXPR: Record<NickelP["expr"], Expr> = {
  smirk: { brow: [0, -6], tilt: [8, -14], lid: [0, 0.38], look: [4, 0], mouth: "smirk" },
  sly: { brow: [6, 6], tilt: [-10, 10], lid: [0.45, 0.45], look: [10, 2], mouth: "smirk" },
  shock: { brow: [-18, -18], tilt: [10, -10], lid: [0, 0], look: [0, 0], pupil: 0.62, mouth: "o" },
  grin: { brow: [-8, -8], tilt: [0, 0], lid: [0, 0], look: [0, -2], mouth: "grin" },
  shh: { brow: [-4, 4], tilt: [6, -6], lid: [0.2, 0.2], look: [-8, 0], mouth: "flat" },
  gotcha: { brow: [-14, 6], tilt: [14, -16], lid: [0, 0.3], look: [6, 0], pupil: 0.85, mouth: "grin" },
};

const eye = (id: string, x: number, side: 0 | 1, e: Expr, blink: number) => {
  const lid = Math.max(e.lid[side], blink);
  const p = e.pupil ?? 1;
  const [lx, ly] = e.look;
  return `<clipPath id="${id}"><ellipse cx="${x}" cy="-6" rx="27" ry="31"/></clipPath>
  <ellipse cx="${x}" cy="-6" rx="27" ry="31" fill="#FFFDF6" ${o}/>
  <g clip-path="url(#${id})">
    <circle cx="${x + lx}" cy="${-2 + ly}" r="${19 * p}" fill="${SODIUM}"/>
    <circle cx="${x + lx}" cy="${-2 + ly}" r="${19 * p}" fill="none" stroke="#B9701A" stroke-width="4"/>
    <circle cx="${x + lx}" cy="${-2 + ly}" r="${10.5 * p}" fill="#140C05"/>
    <circle cx="${x + lx - 7}" cy="${-11 + ly}" r="6" fill="#fff"/><circle cx="${x + lx + 6}" cy="${5 + ly}" r="2.6" fill="#fff"/>
    ${lid ? `<rect x="${x - 30}" y="-40" width="60" height="${f2(64 * lid)}" fill="${MASK}"/><line x1="${x - 30}" y1="${f2(-40 + 64 * lid)}" x2="${x + 30}" y2="${f2(-40 + 64 * lid)}" stroke="${INK}" stroke-width="5"/>` : ""}
  </g>`;
};

const mouth = (kind: string, open: number) => {
  if (open > 0.05) return `<ellipse cx="0" cy="62" rx="${f2(12 + 8 * open)}" ry="${f2(5 + 13 * open)}" fill="#3A1C20" ${o}/>`;
  if (kind === "o") return `<ellipse cx="0" cy="64" rx="11" ry="14" fill="#3A1C20" ${o}/>`;
  if (kind === "grin") return `<path d="M-34,50 Q0,94 34,50 Q0,62 -34,50Z" fill="#3A1C20" ${o}/><path d="M-14,56 L-8,66 L-2,57Z" fill="#fff"/>`;
  if (kind === "flat") return `<path d="M-16,60 Q0,64 16,60" fill="none" ${o}/>`;
  return `<path d="M-26,56 Q4,70 32,48" fill="none" ${o}/><path d="M14,61 L18,71 L23,59Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`;
};

const ear = (dx: number, dy: number, twitch: number) => {
  const one = `<path d="M-112,-62 C-134,-128 -112,-172 -80,-170 C-56,-152 -42,-118 -46,-96Z" fill="${FUR}" ${o}/>
    <path d="M-100,-84 C-114,-126 -102,-150 -84,-150 C-70,-136 -62,-118 -64,-102Z" fill="#2E2427"/>
    <path d="M-92,-110 l8,-18 l4,16" fill="none" stroke="${CREAM}" stroke-width="3"/>`;
  return `<g transform="translate(${-dx},${dy}) rotate(${f2(-twitch)} -80 -90)">${one}</g><g transform="translate(${dx},${dy}) scale(-1,1) rotate(${f2(-twitch * 0.6)} -80 -90)">${one}</g>`;
};

const head = (uid: string, e: Expr, blink: number, open: number, twitch: number, behind: string, front: string) => {
  const brow = (s: -1 | 1) => `<ellipse cx="${s * 50}" cy="${-56 + e.brow[s < 0 ? 0 : 1]}" rx="34" ry="13" fill="${CREAM}" ${o} transform="rotate(${s * e.tilt[s < 0 ? 0 : 1]} ${s * 50} -56)"/>`;
  return `${behind}${ear(0, -10, twitch)}
  <path d="M-118,-24 C-128,-86 -70,-122 0,-122 C70,-122 128,-86 118,-24 L156,4 L120,20 L146,50 L102,58 C82,100 42,118 0,118 C-42,118 -82,100 -102,58 L-146,50 L-120,20 L-156,4Z" fill="${FUR}" ${o}/>
  <path d="M60,104 C96,84 112,60 102,58 L146,50 L120,20 L156,4 L118,-24 C124,10 104,70 60,104Z" fill="${FUR_D}"/>
  <path d="M0,-120 C-13,-84 -11,-52 0,-28 C11,-52 13,-84 0,-120Z" fill="#4A525C"/>
  ${brow(-1)}${brow(1)}
  <path d="M-140,-4 C-112,-58 -40,-52 0,-28 C40,-52 112,-58 140,-4 C114,42 50,46 0,24 C-50,46 -114,42 -140,-4Z" fill="${MASK}"/>
  ${eye(`${uid}l`, -50, 0, e, blink)}${eye(`${uid}r`, 50, 1, e, blink)}
  <path d="M-58,42 C-60,12 -30,0 0,0 C30,0 60,12 58,42 C54,76 26,90 0,90 C-26,90 -54,76 -58,42Z" fill="${CREAM}" ${o}/>
  <path d="M-18,20 C-18,9 18,9 18,20 C18,32 7,38 0,38 C-7,38 -18,32 -18,20Z" fill="#141519"/><ellipse cx="-6" cy="16" rx="6" ry="3" fill="#7A7F88"/>
  ${mouth(e.mouth, open)}${front}`;
};

const tail = (uid: string, rot: number) => {
  const d = "M0,10 C90,40 220,20 268,-90 C296,-160 286,-250 236,-286 C206,-306 166,-298 158,-268 C150,-236 176,-206 178,-160 C180,-100 130,-66 40,-70 C14,-70 -6,-40 0,10Z";
  const stripes = [0, 1, 2, 3, 4].map((i) => `<rect x="-60" y="${-20 - i * 64}" width="420" height="34" transform="rotate(${-24 + i * 4})"/>`).join("");
  return `<g transform="translate(60,-120) rotate(${f2(rot)})"><clipPath id="${uid}t"><path d="${d}"/></clipPath>
    <path d="${d}" fill="${FUR}"/><g clip-path="url(#${uid}t)" fill="${STEEL}">${stripes}</g><path d="${d}" fill="none" ${o}/></g>`;
};

const arm = (x1: number, y1: number, x2: number, y2: number, bend: number) => {
  const d = `M${x1},${y1} Q${f2((x1 + x2) / 2 + bend)},${f2((y1 + y2) / 2)} ${f2(x2)},${f2(y2)}`;
  return `<path d="${d}" stroke="${INK}" stroke-width="52" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${EMBER}" stroke-width="42" fill="none" stroke-linecap="round"/>`;
};
const paw = (x: number, y: number, r: number, finger = false) => `<g transform="translate(${f2(x)},${f2(y)}) rotate(${r})">
  ${finger ? `<rect x="-7" y="-56" width="14" height="44" rx="7" fill="${STEEL}" ${o}/>` : ""}
  <ellipse rx="26" ry="23" fill="${STEEL}" ${o}/><path d="M-12,-14 v10 M0,-17 v12 M12,-14 v10" stroke="#4A505A" stroke-width="3" stroke-linecap="round"/></g>`;

/** The near arm per pose: [hand x, hand y, bend, paw rotation, finger], plus what it holds. */
const NEAR: Record<NickelP["pose"], { to: [number, number]; bend: number; rot: number; finger?: boolean; holds?: string }> = {
  stand: { to: [170, -150], bend: 30, rot: -10 },
  shh: { to: [26, -352], bend: 70, rot: -6, finger: true },
  point: { to: [270, -330], bend: -10, rot: 60, finger: true },
  sip: { to: [70, -330], bend: 80, rot: 0, holds: `<g transform="translate(70,-330)"><path d="M-30,-62 L30,-62 L22,6 L-22,6Z" fill="${PAPER}" ${o}/><rect x="-32" y="-74" width="64" height="14" rx="5" fill="#2A2F36" ${o}/><rect x="-24" y="-38" width="48" height="16" fill="${SODIUM}"/></g>` },
  hold: { to: [210, -380], bend: -20, rot: 20, holds: `<g transform="translate(206,-420) rotate(-12)"><rect x="-58" y="-38" width="116" height="74" rx="10" fill="${SODIUM}" ${o}/><rect x="-58" y="-16" width="116" height="12" fill="${EMBER_D}"/></g>` },
  close: { to: [250, -210], bend: -30, rot: 80 },
};

export const nickelMarkup = (uid: string, p: NickelP, t: number): string => {
  const e = EXPR[p.expr];
  const cycle = (t + 0.7) % 3.4;
  const blink = cycle < 0.12 ? Math.sin((cycle / 0.12) * Math.PI) : 0;
  const open = p.talk > 0 ? p.talk * Math.max(0, 0.45 + 0.55 * noise("nickel", "jaw", t * 7)) : 0;
  const twitch = 4 * Math.max(0, noise("nickel", "ear", t * 0.6) - 0.4);
  const breathe = Math.sin(t * 2.1) * 3;
  const hoodBack = `<path d="M-162,40 C-184,-100 -96,-172 0,-172 C96,-172 184,-100 162,40 C150,96 104,122 60,124 L-60,124 C-104,122 -150,96 -162,40Z" fill="${EMBER_D}" ${o}/>`;
  const lampOn = p.lamp;
  const lamp = `<path d="M-120,-74 C-60,-96 60,-96 120,-74 L118,-56 C60,-78 -60,-78 -118,-56Z" fill="#20252C" ${o}/>
    ${lampOn > 0 ? `<circle cx="0" cy="-90" r="40" fill="${SODIUM}" opacity="${f2(0.3 * lampOn)}"/>` : ""}
    <rect x="-28" y="-112" width="56" height="40" rx="10" fill="#2A2F36" ${o}/><circle cx="0" cy="-92" r="13" fill="${lampOn > 0.5 ? "#FFF1C9" : "#4A505A"}" stroke="${lampOn > 0.5 ? SODIUM : INK}" stroke-width="5"/>`;
  const near = NEAR[p.pose];
  const front = p.pose === "shh" || p.pose === "sip";
  const nearArm = arm(110, -268, near.to[0], near.to[1], near.bend) + (near.holds ?? "") + paw(near.to[0], near.to[1], near.rot, near.finger);
  const farArm = p.pose === "close" ? arm(-100, -270, 180, -170, -20) + paw(180, -170, 80) : arm(-110, -270, -150, -150, -30) + paw(-150, -140, 10);
  return `${tail(uid, 10 + 5 * Math.sin(t * 1.3))}
  <rect x="-74" y="-90" width="48" height="84" rx="14" fill="#1F2A33" ${o}/><rect x="26" y="-90" width="48" height="84" rx="14" fill="#1F2A33" ${o}/>
  <ellipse cx="-50" cy="-8" rx="46" ry="20" fill="${STEEL}" ${o}/><ellipse cx="50" cy="-8" rx="46" ry="20" fill="${STEEL}" ${o}/>
  <g transform="translate(0,${f2(breathe * 0.4)})">
  <path d="M-96,-300 C-150,-280 -152,-140 -136,-84 C-90,-66 90,-66 136,-84 C152,-140 150,-280 96,-300Z" fill="${EMBER}" ${o}/>
  <path d="M50,-292 C120,-270 140,-160 136,-84 C110,-74 80,-70 60,-70Z" fill="${EMBER_D}"/>
  <path d="M-70,-180 L70,-180 L84,-100 L-84,-100Z" fill="${EMBER_D}" ${o}/>
  <path d="M-24,-296 C-28,-250 -30,-220 -34,-196 M24,-296 C28,-250 30,-220 34,-196" stroke="${PAPER}" stroke-width="5" fill="none"/>
  <circle cx="-34" cy="-192" r="6" fill="${PAPER}"/><circle cx="34" cy="-192" r="6" fill="${PAPER}"/>
  ${farArm}${front ? "" : nearArm}
  <g transform="translate(0,${f2(-420 + breathe)})">${head(uid, e, blink, open, twitch, hoodBack, lamp)}</g>
  ${front ? nearArm : ""}</g>`;
};

/** The headlamp's beam: a soft cone from the lamp, `beam` degrees below level, `beamLength` of 1400 units. */
const beamMarkup = (p: NickelP) => {
  const len = 1400 * p.beamLength;
  if (len < 1 || p.lamp <= 0) return "";
  const a = (p.beam * Math.PI) / 180;
  const spread = 0.2;
  const pt = (k: number) => `${f2(Math.cos(a + k) * len)},${f2(Math.sin(a + k) * len)}`;
  return `<g transform="translate(0,-512)" opacity="${f2(p.lamp)}"><polygon points="0,-8 ${pt(-spread)} ${pt(spread)} 0,8" fill="${SODIUM}" opacity="0.2"/><polygon points="0,-5 ${pt(-spread * 0.5)} ${pt(spread * 0.5)} 0,5" fill="${SODIUM}" opacity="0.14"/></g>`;
};

/** Nickel in the figure box: fit by height, feet on the box bottom, `rise` lifts him into view from below it. */
export const Nickel: React.FC<DrawProps<NickelP>> = ({ p, w, h, t, reveal }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = Math.min(h / 640, w / 600);
  const rise = Math.min(p.rise, reveal < 1 ? reveal : 1);
  const drop = (1 - rise) * 640 * s;
  const flip = p.facing === "left" ? -1 : 1;
  const body = nickelMarkup(uid, p, t);
  return (
    <g>
      <defs>
        <clipPath id={`nc${uid}`}>
          <rect x={f2(-w)} y={f2(-h * 2)} width={f2(w * 3)} height={f2(h * 3)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#nc${uid})`}>
        <g transform={`translate(${f2(w / 2)} ${f2(h + drop)}) scale(${f2(s * flip)} ${f2(s)})`}>
          <g dangerouslySetInnerHTML={{ __html: beamMarkup(p) + body }} />
        </g>
      </g>
    </g>
  );
};
