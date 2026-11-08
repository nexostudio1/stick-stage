/** More hero props (see `props.tsx`): cups, coins, vault, cup, lost-and-found shelf, book, lamp. */
import { f2 } from "../../../lib/math";
import { rand } from "../../../lib/seed";
import type { PropP } from "../../paramsNight";
import { NIGHT } from "./tokens";

const { ink: INK, paper: PAPER, sodium: SODIUM, ember: EMBER, neon: NEON } = NIGHT;
const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const T = (x: number, y: number, size: number, fill: string, s: string, font = "Catch Display", weight = 800, anchor = "middle") =>
  `<text x="${f2(x)}" y="${f2(y)}" font-family="${font}" font-weight="${weight}" font-size="${f2(size)}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;

type Markup = (p: PropP, t: number, uid: string) => string;

// A plain kraft cup with a ribbed sleeve: no white body, band or badge, so it reads as no chain's cup.
const KRAFT = "#B98A55";
const SLEEVE = "#7E5631";

/** One takeaway cup at (x, 0): `fill` 0…1 of coins in it, `steam` 0…1 rising off it. */
const cupAt = (x: number, s: number, fill: number, steam: number, t: number, i: number) => {
  const coins = Math.round(fill * 4);
  const wisps = steam > 0.02
    ? [0, 1].map((k) => {
        const ph = t * 0.9 + k * 0.5 + i * 0.3;
        const y = -((ph % 1) * 90);
        return `<path d="M${-10 + k * 22},${f2(-250 + y)} q-14,-26 0,-50 q14,-24 0,-48" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round" opacity="${f2(steam * 0.5 * (1 - (ph % 1)))}"/>`;
      }).join("")
    : "";
  return `<g transform="translate(${f2(x)},0) scale(${f2(s)})">
    ${wisps}
    ${Array.from({ length: coins }, (_, k) => `<ellipse cx="${-16 + (k % 2) * 30}" cy="${-206 - k * 12}" rx="26" ry="10" fill="${SODIUM}" ${o}/>`).join("")}
    <path d="M-70,-200 L70,-200 L56,0 L-56,0Z" fill="${KRAFT}" ${o}/>
    <path d="M-66,-150 L66,-150 L60,-70 L-60,-70Z" fill="${SLEEVE}" ${o}/>
    ${[-124, -110, -96].map((y) => `<path d="M${f2(-62 + (y + 150) * 0.07)},${y} L${f2(62 - (y + 150) * 0.07)},${y}" stroke="${INK}" stroke-width="3" opacity="0.35"/>`).join("")}
    <path d="M-80,-198 L80,-198 L72,-222 Q0,-246 -72,-222Z" fill="#2A3640" ${o}/>
    <rect x="18" y="-240" width="30" height="12" rx="5" fill="#2A3640" ${o}/>
  </g>`;
};

const cups: Markup = (p, t) => {
  const n = p.count;
  const gap = 760 / n;
  const s = Math.min(1, gap / 170);
  // `strike` is how much steam is left across the row: the cups on the right go cold first.
  return Array.from({ length: n }, (_, i) => cupAt(-380 + gap * (i + 0.5), s, c01(p.open * n - i), p.strike === 0 ? 0 : c01(p.strike * n - i), t, i)).join("");
};

const coins: Markup = (p, t) => {
  const k = 0.25 + 0.75 * p.open;
  const items = Array.from({ length: 70 }, (_, i) => {
    const u = rand("coins", i);
    const v = rand("coins", `y${i}`);
    const x = (u - 0.5) * 760 * k * (1 - v * 0.7);
    const y = -v * 420 * k;
    const card = i % 4 === 0;
    const r = (rand("coins", `r${i}`) - 0.5) * 50;
    return card
      ? `<rect x="${f2(x - 44)}" y="${f2(y - 28)}" width="88" height="56" rx="8" fill="${i % 8 === 0 ? SODIUM : "#3D6E8C"}" ${o} transform="rotate(${f2(r)} ${f2(x)} ${f2(y)})"/>`
      : `<ellipse cx="${f2(x)}" cy="${f2(y + Math.sin(t * 3 + i) * 2)}" rx="28" ry="11" fill="${SODIUM}" ${o}/>`;
  });
  return `<path d="M${f2(-400 * k)},0 Q0,${f2(-560 * k)} ${f2(400 * k)},0Z" fill="#B9822F" ${o}/>${items.join("")}`;
};

const vault: Markup = (p, t) => `<g transform="translate(0,-280)">
    <circle r="250" fill="#2A3A44" ${o}/><circle r="200" fill="#34484F" ${o}/>
    <g transform="rotate(${f2(p.open * 220 + Math.sin(t) * 2)})"><circle r="70" fill="#2A3A44" ${o}/>
      ${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="-10" y="-150" width="20" height="80" rx="8" fill="#4E646C" ${o} transform="rotate(${a})"/>`).join("")}</g>
    ${[45, 135, 225, 315].map((a) => `<circle cx="${f2(Math.cos((a * Math.PI) / 180) * 226)}" cy="${f2(Math.sin((a * Math.PI) / 180) * 226)}" r="10" fill="#4E646C" ${o}/>`).join("")}
    <g transform="translate(0,${f2(-300 - 40 * p.open)})" opacity="${f2(c01(p.open * 3))}">${T(0, 0, 90, NEON, p.text ?? `+${(4.5 * p.open).toFixed(1)}%`, "Catch Numbers", 900)}</g>
  </g>`;

const cup: Markup = (p, t) => `${cupAt(0, 1.7, 0, 1, t, 0)}${p.text ? T(0, 70, 54, PAPER, p.text) : ""}`;

const lostbox: Markup = (p) => {
  const items = [
    { x: -270, w: 200, h: 170, fill: "#4B3B5C", label: "COAT" },
    { x: -20, w: 230, h: 190, fill: "#8A6A44", label: "MOVING BOX" },
    { x: 240, w: 180, h: 110, fill: SODIUM, label: "CARD" },
  ];
  return `<rect x="-400" y="-20" width="800" height="30" fill="#2A3A44" ${o}/>
    ${items
      .map((it, i) => {
        const flipped = c01(p.open * 3 - i);
        const money = c01(p.flip * 3 - i);
        const tag = money > 0.5 ? "$" : flipped > 0.5 ? "BREAKAGE" : it.label;
        const sy = Math.abs(Math.cos(Math.PI * (money > 0 ? money : flipped)));
        return `<g transform="translate(${it.x},-20)">
          <rect x="${-it.w / 2}" y="${-it.h}" width="${it.w}" height="${it.h}" rx="12" fill="${it.fill}" ${o}/>
          ${it.fill === SODIUM ? T(0, -it.h / 2 + 20, 56, INK, "$3.17", "Catch Numbers", 900) : ""}
          <path d="M0,${-it.h} L0,${-it.h - 40}" stroke="${PAPER}" stroke-width="3"/>
          <g transform="translate(0,${-it.h - 70}) scale(1,${f2(Math.max(0.05, sy))})">
            <rect x="-90" y="-30" width="180" height="60" rx="8" fill="${tag === "BREAKAGE" ? EMBER : PAPER}" ${o}/>
            ${T(0, 11, tag.length > 6 ? 26 : 34, INK, tag, "Catch Mono", 600)}
          </g></g>`;
      })
      .join("")}`;
};

const book: Markup = (p) => {
  const a = p.open;
  const note = p.text ?? "Read this one. Love, Gran";
  return `<g transform="translate(0,-60)">
    <path d="M0,0 L-360,-30 L-360,-330 L0,-300Z" fill="${PAPER}" ${o}/>
    <path d="M0,0 L${f2(360 - 720 * a)},-30 L${f2(360 - 720 * a)},-330 L0,-300Z" fill="${a > 0.5 ? PAPER : "#2F5D50"}" ${o}/>
    ${a > 0.95 ? `${T(-180, -200, 34, "#3A4A58", note.split(". ")[0] + ".", "Catch Display", 600)}${T(-180, -150, 34, "#3A4A58", note.split(". ").slice(1).join(". "), "Catch Display", 600)}` : ""}
    ${a < 0.5 ? T(180, -170, 40, SODIUM, "★", "Catch Display", 800) : ""}
  </g>`;
};

const lamp: Markup = (p, t) => {
  const flick = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.1);
  return `<path d="M0,-600 L0,-420" stroke="#1A262E" stroke-width="6"/><path d="M-120,-330 L-70,-420 L70,-420 L120,-330Z" fill="#20303A" ${o}/><ellipse cx="0" cy="-330" rx="60" ry="16" fill="#FFF1C9" opacity="${f2(flick)}"/>`;
};

export const MORE_PROPS: Record<string, Markup> = { cups, coins, vault, cup, lostbox, book, lamp };
