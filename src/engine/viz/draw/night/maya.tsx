/**
 * Maya, Case 001's human lead: an original toon in the same ink-outline style as Nickel (5-unit
 * ink line, flat fills). Pyjamas for the night kitchen, a day outfit for the bookshop. Native
 * units: feet at y = 0, about 640 tall.
 */
import React from "react";
import { f2 } from "../../../lib/math";
import { noise } from "../../../lib/seed";
import type { MayaP } from "../../paramsNight";
import type { DrawProps } from "../common";
import { NIGHT } from "./tokens";

const { ink: INK, paper: PAPER, sodium: SODIUM, ember: EMBER } = NIGHT;
const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const SKIN = "#C98E6B";
const SKIN_D = "#A87154";
const HAIR = "#2B1C18";

const OUTFIT = {
  pyjamas: { top: "#3D6E8C", topD: "#2F5770", legs: "#3D6E8C", dots: PAPER, shoes: "#E8D9C0" },
  day: { top: "#E9DCC2", topD: "#CDBEA2", legs: "#24485A", dots: "", shoes: "#3A2A24" },
} as const;

const face = (p: MayaP, blink: number, open: number) => {
  const lidY = (k: number) => f2(-14 + 26 * k);
  const eye = (x: number) => `<ellipse cx="${x}" cy="0" rx="11" ry="14" fill="${INK}"/><circle cx="${x + 4}" cy="-5" r="4" fill="#fff"/>
    ${blink > 0.05 ? `<rect x="${x - 14}" y="-16" width="28" height="${lidY(blink)}" fill="${SKIN}"/>` : ""}`;
  const browY = p.expr === "wonder" ? -46 : p.expr === "guilty" ? -34 : -40;
  const browTilt = p.expr === "guilty" ? 10 : p.expr === "soft" ? -4 : 0;
  const mouth =
    open > 0.05
      ? `<ellipse cx="6" cy="48" rx="${f2(10 + 5 * open)}" ry="${f2(4 + 10 * open)}" fill="#5A2228" ${o}/>`
      : p.expr === "guilty"
        ? `<path d="M-10,48 Q6,40 24,50" fill="none" ${o}/>`
        : p.expr === "wonder"
          ? `<ellipse cx="6" cy="50" rx="8" ry="10" fill="#5A2228" ${o}/>`
          : `<path d="M-14,44 Q6,62 26,44" fill="none" ${o}/>`;
  return `${eye(-26)}${eye(34)}
    <path d="M-44,${browY} l28,${-browTilt * 0.4}" ${o} fill="none"/><path d="M18,${browY - browTilt * 0.4} l30,${browTilt * 0.4}" ${o} fill="none"/>
    <path d="M6,14 q-6,14 4,18" fill="none" stroke="${SKIN_D}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="-44" cy="30" rx="14" ry="8" fill="${EMBER}" opacity="0.25"/><ellipse cx="54" cy="30" rx="14" ry="8" fill="${EMBER}" opacity="0.25"/>
    ${mouth}`;
};

const arm = (x1: number, y1: number, x2: number, y2: number, bend: number, color: string) => {
  const d = `M${x1},${y1} Q${f2((x1 + x2) / 2 + bend)},${f2((y1 + y2) / 2)} ${x2},${y2}`;
  return `<path d="${d}" stroke="${INK}" stroke-width="44" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${color}" stroke-width="34" fill="none" stroke-linecap="round"/>`;
};
const hand = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="19" fill="${SKIN}" ${o}/>`;
const card = (x: number, y: number, r: number) =>
  `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-46" y="-30" width="92" height="60" rx="8" fill="${SODIUM}" ${o}/><rect x="-46" y="-12" width="92" height="9" fill="#C8892E"/><text x="22" y="22" font-family="Catch Numbers" font-weight="900" font-size="22" fill="${INK}" text-anchor="middle">$50</text></g>`;

export const mayaMarkup = (p: MayaP, t: number): string => {
  const c = OUTFIT[p.outfit];
  const cycle = (t + 1.9) % 3.9;
  const blink = cycle < 0.13 ? Math.sin((cycle / 0.13) * Math.PI) : 0;
  const open = p.talk > 0 ? p.talk * Math.max(0, 0.4 + 0.6 * noise("maya", "jaw", t * 7)) : 0;
  const sway = Math.sin(t * 1.7) * 2;
  const dots = c.dots
    ? [[-50, -330], [20, -300], [60, -360], [-20, -240], [50, -210], [-60, -190], [10, -380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c.dots}" opacity="0.8"/>`).join("")
    : `<path d="M-40,-396 Q0,-370 40,-396" fill="none" stroke="${c.topD}" stroke-width="6"/>`;
  const near =
    p.pose === "hold"
      ? arm(70, -370, 150, -430, 50, c.top) + card(160, -470, -10) + hand(150, -430)
      : p.pose === "reach"
        ? arm(70, -370, 220, -300, -20, c.top) + card(250, -300, 8) + hand(220, -300)
        : arm(70, -370, 96, -200, 20, c.top) + hand(96, -196);
  return `
  <rect x="-62" y="-170" width="52" height="160" rx="18" fill="${c.legs}" ${o}/><rect x="10" y="-170" width="52" height="160" rx="18" fill="${c.legs}" ${o}/>
  <ellipse cx="-40" cy="-8" rx="44" ry="18" fill="${c.shoes}" ${o}/><ellipse cx="44" cy="-8" rx="44" ry="18" fill="${c.shoes}" ${o}/>
  <g transform="rotate(${f2(sway * 0.3)} 0 -160)">
  ${arm(-70, -370, -96, -200, -20, c.topD)}${hand(-96, -196)}
  <path d="M-80,-410 C-104,-330 -100,-220 -88,-150 L88,-150 C100,-220 104,-330 80,-410 C40,-428 -40,-428 -80,-410Z" fill="${c.top}" ${o}/>
  ${dots}
  <rect x="-22" y="-450" width="44" height="46" fill="${SKIN}" ${o}/>
  <g transform="translate(0,-540) rotate(${f2(sway)})">
    <circle cx="-6" cy="-104" r="44" fill="${HAIR}" ${o}/>
    <path d="M-92,10 C-104,-80 -60,-122 4,-122 C70,-122 106,-80 96,10 C80,-10 70,-50 40,-62 C10,-40 -40,-40 -72,-56 C-84,-30 -86,-10 -92,10Z" fill="${HAIR}" ${o}/>
    <ellipse cx="4" cy="0" rx="86" ry="92" fill="${SKIN}" ${o}/>
    <path d="M-86,-14 C-84,-80 -40,-104 6,-104 C60,-104 92,-70 90,-14 C66,-40 40,-60 10,-56 C-20,-52 -60,-40 -86,-14Z" fill="${HAIR}" ${o}/>
    <ellipse cx="-84" cy="10" rx="13" ry="18" fill="${SKIN}" ${o}/>
    ${face(p, blink, open)}
  </g>
  ${near}
  </g>`;
};

export const Maya: React.FC<DrawProps<MayaP>> = ({ p, w, h, t }) => {
  const s = Math.min(h / 690, w / 520);
  const flip = p.facing === "left" ? -1 : 1;
  return (
    <g transform={`translate(${f2(w / 2)} ${f2(h)}) scale(${f2(s * flip)} ${f2(s)})`}>
      <g dangerouslySetInnerHTML={{ __html: mayaMarkup(p, t) }} />
    </g>
  );
};
