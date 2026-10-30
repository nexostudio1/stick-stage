/**
 * Hero props for the night-shift world, as SVG markup in a native 800 × 600 box (origin at the
 * bottom centre). Each prop has one motion (`open`) and some a second (`strike`, `flip`).
 * The `Prop` drawer fits the box, adds the light cone and dims props that aren't the hero.
 */
import React, { useId } from "react";
import { f2 } from "../../../lib/math";
import type { PropP } from "../../paramsNight";
import type { DrawProps } from "../common";
import { MORE_PROPS } from "./props2";
import { CATCH_FONTS, NIGHT } from "./tokens";

const { ink: INK, paper: PAPER, sodium: SODIUM, ember: EMBER, teal: TEAL, steel: STEEL } = NIGHT;
export const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
export const txt = (x: number, y: number, size: number, fill: string, s: string, font: "display" | "numbers" | "mono" = "display", anchor = "middle", extra = "") =>
  `<text x="${f2(x)}" y="${f2(y)}" font-family="${CATCH_FONTS[font]}" font-weight="${font === "mono" ? 600 : font === "numbers" ? 900 : 800}" font-size="${f2(size)}" fill="${fill}" text-anchor="${anchor}" ${extra}>${s}</text>`;
const heart = (x: number, y: number, s: number) =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M0,10 C-26,-8 -18,-30 0,-18 C18,-30 26,-8 0,10Z" fill="${EMBER}"/>`;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type PropMarkup = (p: PropP, t: number, uid: string) => string;

const envelopeAt = (x: number, y: number, s: number, open: number) => {
  const lift = 120 * open;
  return `<g transform="translate(${x},${y}) scale(${s})">
    ${open > 0 ? `<g transform="translate(0,${f2(-lift)})"><rect x="-120" y="-80" width="240" height="150" rx="8" fill="${SODIUM}" ${o}/>${txt(60, 40, 52, INK, "$50", "numbers")}</g>` : ""}
    <rect x="-150" y="-90" width="300" height="190" rx="10" fill="${PAPER}" ${o}/>
    <path d="M-150,-90 L0,${f2(Math.max(-200, 10 - 220 * open))} L150,-90" fill="#E6D8BC" ${o}/>
    <path d="M-150,100 L-20,10 M150,100 L20,10" ${o} fill="none" opacity="0.5"/>
    ${heart(0, 40, 1.6)}
  </g>`;
};

const drawer: PropMarkup = (p) => {
  const d = 200 * p.open;
  const items = `
    <rect x="-280" y="${f2(-d - 10)}" width="70" height="26" rx="6" fill="#3B4650" ${o}/><rect x="-200" y="${f2(-d - 6)}" width="70" height="26" rx="6" fill="#3B4650" ${o}/>
    <rect x="-110" y="${f2(-d - 40)}" width="150" height="90" fill="#D8CDB4" ${o} transform="rotate(-8 -40 ${f2(-d)})"/>
    ${txt(-40, -d + 6, 20, "#6B5E48", "MENU", "mono", "middle", `transform="rotate(-8 -40 ${f2(-d)})"`)}
    <rect x="150" y="${f2(-d - 30)}" width="110" height="60" rx="8" fill="#6E3B2E" ${o}/>
    ${envelopeAt(70, -d * 0.55 - 6, 0.55, 0)}`;
  return `<g transform="translate(0,-60)">
    <rect x="-390" y="-330" width="780" height="330" fill="#16242E" ${o}/>
    ${p.open > 0 ? `<path d="M-340,0 L-300,${f2(-d)} L300,${f2(-d)} L340,0Z" fill="#0F1A21" ${o}/><g clip-path="none">${items}</g>` : ""}
    <rect x="-360" y="${f2(-150 + d * 0.25)}" width="720" height="150" rx="10" fill="${TEAL}" ${o}/>
    <rect x="-90" y="${f2(-90 + d * 0.25)}" width="180" height="24" rx="12" fill="${STEEL}" ${o}/>
    <rect x="-360" y="-330" width="720" height="150" rx="10" fill="#1A3A43" ${o}/>
    <rect x="-90" y="-270" width="180" height="24" rx="12" fill="${STEEL}" ${o}/>
  </g>`;
};

const envelope: PropMarkup = (p) => envelopeAt(0, -170, 1.6, p.open);

const giftcard: PropMarkup = (p, _t, uid) => {
  const amount = p.text ?? "$50";
  const flip = Math.cos(Math.PI * p.flip);
  const back = p.flip > 0.5;
  const split = p.strike;
  const face = (clip: string) =>
    back
      ? `<g ${clip}><rect x="-280" y="-175" width="560" height="350" rx="26" fill="#14222B" ${o}/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="-220" y="${-110 + i * 40}" width="${[440, 400, 430, 300, 420, 260][i]}" height="10" rx="5" fill="${NIGHT.neon}" opacity="0.75"/>`).join("")}
          ${txt(-220, -130, 26, PAPER, "TERMS &amp; CONDITIONS", "mono", "start")}</g>`
      : `<g ${clip}><rect x="-280" y="-175" width="560" height="350" rx="26" fill="${SODIUM}" ${o}/>
          <rect x="-280" y="-60" width="560" height="34" fill="#C8892E"/><rect x="40" y="-175" width="34" height="350" fill="#C8892E"/>
          ${txt(-230, 140, 120, INK, amount, "numbers", "start")}${txt(230, -120, 26, INK, "GIFT CARD", "mono", "end")}
          ${heart(-200, -110, 1.3)}</g>`;
  if (split <= 0) return `<g transform="translate(0,-260) scale(${f2(flip)},1)">${face("")}</g>`;
  const jag = "M10,-200 L-20,-120 L18,-40 L-14,40 L20,120 L-10,200";
  return `<g transform="translate(0,-260)">
    <clipPath id="gl${uid}"><path d="M-400,-200 ${jag.replace("M", "L")} L-400,200Z"/></clipPath>
    <clipPath id="gr${uid}"><path d="M400,-200 ${jag.replace("M", "L")} L400,200Z"/></clipPath>
    <g transform="translate(${f2(-160 * split)},${f2(-40 * split)}) rotate(${f2(-8 * split)})">${face(`clip-path="url(#gl${uid})"`)}</g>
    <g transform="translate(${f2(160 * split)},${f2(170 * split)}) rotate(${f2(10 * split)})" opacity="${f2(1 - 0.35 * split)}">${face(`clip-path="url(#gr${uid})"`)}</g>
  </g>`;
};

const till: PropMarkup = (p) => {
  const go = p.open;
  const sleeve = "#7C5C8A";
  const handX = -380 + 300 * clamp01(go * 1.4);
  return `<g>
    <path d="M-200,-60 L200,-60 L240,-240 L-160,-240Z" fill="#203540" ${o}/>
    <rect x="-150" y="-380" width="260" height="140" rx="12" fill="#18262F" ${o}/>
    <rect x="-120" y="-350" width="200" height="70" rx="6" fill="#0A1218" ${o}/>${txt(-20, -297, 52, SODIUM, go > 0.5 ? "50.00" : "0.00", "numbers")}
    ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${-130 + c * 70}" y="${-220 + r * 44}" width="56" height="32" rx="6" fill="#2F4651" ${o}/>`).join("")).join("")}
    <rect x="-230" y="${f2(-60 + 10)}" width="460" height="${f2(50 + 50 * clamp01(go * 2 - 1))}" rx="8" fill="#16242E" ${o}/>
    <g transform="translate(${f2(handX)},-300) rotate(-6)" opacity="${f2(clamp01(1.6 - go * 1.4))}">
      <rect x="40" y="-34" width="170" height="78" rx="6" fill="#8FB89A" ${o}/>${txt(125, 20, 44, "#1F3A28", "50", "numbers")}
    </g>
    <g transform="translate(${f2(handX - 40)},-280)">
      <path d="M-260,-20 L-10,-36 L-6,40 L-260,40Z" fill="${sleeve}" ${o}/>
      <path d="M-14,-40 C30,-56 90,-46 110,-20 C124,0 110,26 80,30 L-10,40Z" fill="#E2B49A" ${o}/>
      <circle cx="40" cy="-38" r="9" fill="${SODIUM}" ${o}/>
    </g>
  </g>`;
};

const ledger: PropMarkup = (p) => {
  const word = p.text ?? "SALE";
  const lines = (x: number) => [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${x},${-380 + i * 48} h300" stroke="#B9AC8E" stroke-width="3"/>`).join("");
  return `<g>
    <path d="M-380,-40 L-20,-20 L-20,-440 L-380,-460Z" fill="${PAPER}" ${o}/>
    <path d="M380,-40 L20,-20 L20,-440 L380,-460Z" fill="#EDE1C6" ${o}/>
    <path d="M-20,-20 Q0,-6 20,-20 L20,-440 Q0,-426 -20,-440Z" fill="#CDBF9F" ${o}/>
    ${lines(-350)}${lines(50)}
    ${txt(-200, -230, 110, "#24323B", word)}
    ${txt(200, -330, 36, "#5C6B74", "+ $50.00", "numbers")}
    ${p.strike > 0 ? `<path d="M-360,-262 L${f2(-360 + 330 * p.strike)},${f2(-262 + 30 * p.strike)}" stroke="${EMBER}" stroke-width="16" stroke-linecap="round"/>` : ""}
  </g>`;
};

const jar: PropMarkup = (p, t) => {
  const label = p.text ?? "STORE";
  const coins = Array.from({ length: 14 }, (_, i) => `<ellipse cx="${-110 + (i % 5) * 55 + (Math.floor(i / 5) % 2) * 25}" cy="${-50 - Math.floor(i / 5) * 26}" rx="30" ry="11" fill="${SODIUM}" ${o}/>`).join("");
  const a = t * 240;
  return `<g>
    <path d="M-170,-430 L170,-430 L170,-390 C200,-370 210,-330 210,-280 L210,-40 C210,-14 190,0 160,0 L-160,0 C-190,0 -210,-14 -210,-40 L-210,-280 C-210,-330 -200,-370 -170,-390Z" fill="${NIGHT.neon}" opacity="0.12" ${o}/>
    ${coins}
    <g transform="translate(-10,-200) rotate(-6)"><rect x="-90" y="-50" width="180" height="100" rx="6" fill="${PAPER}" ${o}/>${txt(0, 22, 58, INK, "IOU")}</g>
    <rect x="-180" y="-470" width="360" height="50" rx="10" fill="#2A3640" ${o}/>
    <rect x="-150" y="-380" width="300" height="70" rx="6" fill="${PAPER}" ${o}/>${txt(0, -330, 44, INK, label, "mono")}
    <g transform="translate(330,-330)"><circle r="80" fill="${PAPER}" ${o}/>
      <path d="M0,0 L${f2(Math.sin((a * Math.PI) / 180) * 56)},${f2(-Math.cos((a * Math.PI) / 180) * 56)}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M0,0 L${f2(Math.sin((a * Math.PI) / 2160) * 38)},${f2(-Math.cos((a * Math.PI) / 2160) * 38)}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>
    <path d="M-170,-400 C-190,-330 -194,-200 -186,-80" stroke="#fff" stroke-width="10" fill="none" opacity="0.25" stroke-linecap="round"/>
  </g>`;
};

const PROPS: Record<string, PropMarkup> = { drawer, envelope, giftcard, till, ledger, jar, ...MORE_PROPS };

/** A hero prop: fitted to the box, under its own light cone, dimmed when it isn't the hero. */
export const Prop: React.FC<DrawProps<PropP>> = ({ p, w, h, t }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = Math.min(w / 820, h / 620);
  const markup = PROPS[p.prop]?.(p, t, uid) ?? "";
  const top = -h / s;
  return (
    <g transform={`translate(${f2(w / 2)} ${f2(h)}) scale(${f2(s)})`}>
      {p.cone ? (
        <g>
          <defs>
            <linearGradient id={`cone${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={SODIUM} stopOpacity={0.4} />
              <stop offset="1" stopColor={SODIUM} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={`-70,${f2(top)} 70,${f2(top)} 440,0 -440,0`} fill={`url(#cone${uid})`} opacity={0.75 + 0.08 * Math.sin(t * 9) * Math.sin(t * 2.3)} />
          <ellipse cx={0} cy={0} rx={420} ry={40} fill={SODIUM} opacity={0.12} />
        </g>
      ) : null}
      <g opacity={1 - 0.6 * p.dim} dangerouslySetInnerHTML={{ __html: markup }} />
    </g>
  );
};
