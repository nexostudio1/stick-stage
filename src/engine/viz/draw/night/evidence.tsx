/** The evidence board (pinned cards joined by red string) and the phone note (a typed checklist). */
import React from "react";
import { easeOutBack } from "../../../lib/easing";
import { f2 } from "../../../lib/math";
import type { EvidenceP, PhoneP } from "../../paramsNight";
import type { DrawProps } from "../common";
import { CATCH_FONTS, NIGHT, outline } from "./tokens";

/** Cards pinned across the box; `lit` of them light up (a pin glows) and the string runs card to card. */
export const Evidence: React.FC<DrawProps<EvidenceP>> = ({ p, w, h, reveal }) => {
  const n = p.items.length;
  const cw = Math.min((w / n) * 0.78, h * 0.62);
  const ch = cw * 0.72;
  const k = cw / 300;
  const pos = p.items.map((_, i) => ({ x: (w / n) * (i + 0.5), y: h * (i % 2 === 0 ? 0.4 : 0.6), r: i % 2 === 0 ? -3 : 4 }));
  const strung = Math.max(0, p.lit - 1);
  return (
    <g opacity={Math.min(1, reveal * 2)}>
      {pos.slice(0, -1).map((a, i) => {
        const b = pos[i + 1]!;
        const u = Math.max(0, Math.min(1, strung - i));
        return u > 0 ? <line key={`s${i}`} x1={f2(a.x)} y1={f2(a.y - ch * 0.42)} x2={f2(a.x + (b.x - a.x) * u)} y2={f2(a.y - ch * 0.42 + (b.y - a.y) * u)} stroke="#C2342A" strokeWidth={f2(5 * k)} /> : null;
      })}
      {p.items.map((it, i) => {
        const { x, y, r } = pos[i]!;
        const lit = Math.max(0, Math.min(1, p.lit - i));
        const pop = lit > 0 ? easeOutBack(lit, 1.8) : 0;
        return (
          <g key={i} transform={`translate(${f2(x)} ${f2(y)}) rotate(${r}) scale(${f2(0.92 + 0.08 * pop)})`}>
            <rect x={f2(-cw / 2)} y={f2(-ch / 2)} width={f2(cw)} height={f2(ch)} rx={f2(6 * k)} fill={lit > 0.5 ? NIGHT.paper : "#B8AE98"} {...outline(k)} />
            <text y={f2(ch * 0.08)} textAnchor="middle" fontFamily={CATCH_FONTS.numbers} fontWeight={900} fontSize={f2(ch * (it.text.length > 8 ? 0.3 : 0.42))} fill={NIGHT.ink}>
              {it.text}
            </text>
            {it.sub ? (
              <text y={f2(ch * 0.34)} textAnchor="middle" fontFamily={CATCH_FONTS.mono} fontWeight={600} fontSize={f2(Math.min(ch * 0.1, (cw * 1.55) / it.sub.length))} fill="#4A5560">
                {it.sub.toUpperCase()}
              </text>
            ) : null}
            <circle cy={f2(-ch * 0.42)} r={f2(11 * k)} fill={lit > 0.5 ? NIGHT.ember : "#7A3A30"} {...outline(k * 0.7)} />
            {lit > 0.5 ? <circle cy={f2(-ch * 0.42)} r={f2(26 * k)} fill={NIGHT.ember} opacity={0.25} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** A phone held in frame: a note titled `title`, items typed in one by one, then ticked. */
export const Phone: React.FC<DrawProps<PhoneP>> = ({ p, w, h, reveal, t }) => {
  const ph = h * 0.98;
  const pw = Math.min(w, ph * 0.52);
  const k = pw / 400;
  const x0 = (w - pw) / 2;
  const y0 = (h - ph) / 2 + (1 - Math.min(1, reveal * 1.5)) * h * 0.3;
  const fs = 28 * k;
  return (
    <g transform={`translate(${f2(x0)} ${f2(y0)})`} opacity={Math.min(1, reveal * 2)}>
      <rect width={f2(pw)} height={f2(ph)} rx={f2(48 * k)} fill="#11181E" {...outline(k)} />
      <rect x={f2(16 * k)} y={f2(16 * k)} width={f2(pw - 32 * k)} height={f2(ph - 32 * k)} rx={f2(36 * k)} fill={NIGHT.paper} />
      <text x={f2(44 * k)} y={f2(110 * k)} fontFamily={CATCH_FONTS.display} fontWeight={800} fontSize={f2(fs * 1.5)} fill={NIGHT.ink}>
        {p.title}
      </text>
      {p.items.map((it, i) => {
        const typed = Math.max(0, Math.min(1, p.typed - i));
        if (typed <= 0) return null;
        const chars = Math.ceil(it.length * typed);
        const done = p.done - i >= 1;
        const y = 190 * k + i * fs * 2.1;
        const caret = typed < 1 && Math.floor(t * 3) % 2 === 0;
        return (
          <g key={i}>
            <rect x={f2(44 * k)} y={f2(y - fs * 0.85)} width={f2(fs)} height={f2(fs)} rx={f2(8 * k)} fill={done ? NIGHT.sodium : "none"} stroke={NIGHT.ink} strokeWidth={f2(3 * k)} />
            {done ? <path d={`M${f2(52 * k)},${f2(y - fs * 0.35)} l${f2(fs * 0.25)},${f2(fs * 0.25)} l${f2(fs * 0.45)},${f2(-fs * 0.55)}`} fill="none" stroke={NIGHT.ink} strokeWidth={f2(4 * k)} strokeLinecap="round" /> : null}
            <text x={f2(44 * k + fs * 1.5)} y={f2(y)} fontFamily={CATCH_FONTS.display} fontWeight={600} fontSize={f2(fs)} fill={NIGHT.ink}>
              {it.slice(0, chars) + (caret ? "|" : "")}
            </text>
          </g>
        );
      })}
    </g>
  );
};
