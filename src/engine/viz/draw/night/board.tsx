import React, { useId } from "react";
import { easeOutBack, easeOutCubic } from "../../../lib/easing";
import { f2 } from "../../../lib/math";
import { rand } from "../../../lib/seed";
import { formatValue, type Unit } from "../../paramsData";
import type { CrowdP, FlapP, PhraseP, StampP } from "../../paramsNight";
import { phase, type DrawProps } from "../common";
import { alpha, CATCH_FONTS, NIGHT } from "./tokens";

const TONE = { paper: NIGHT.paper, sodium: NIGHT.sodium, ember: NIGHT.ember, neon: NIGHT.neon } as const;
export const toneOf = (t: keyof typeof TONE): string => TONE[t];

/** A soft glow behind text or a shape: blur the source, lay it under the original. */
export const Glow: React.FC<{ id: string; r: number }> = ({ id, r }) => (
  <defs>
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={f2(r)} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const uidOf = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");

const flapText = (p: FlapP): string => {
  if (p.text) return p.text;
  if (p.value === undefined) return "";
  const u: Unit = p.unit;
  const s = formatValue(p.value, u);
  return p.group ? s : s.replace(/,/g, "");
};

/**
 * A split-flap board: one dark tile per character, the number glowing in Big Shoulders. Tiles flip
 * in left to right on the reveal; a `set` cue on `value` riffles the digits as it tweens.
 */
export const Flap: React.FC<DrawProps<FlapP>> = ({ p, w, h, reveal }) => {
  const uid = uidOf(useId());
  const chars = [...flapText(p)];
  while (chars.length < p.tiles) chars.unshift(" ");
  const n = Math.max(1, chars.length);
  const capH = p.caption ? h * 0.16 : 0;
  const gap = Math.min(w, h) * 0.035;
  const tileW = Math.min((h - capH) / 1.45, (w - gap * (n + 1)) / n);
  const tileH = tileW * 1.45;
  const boardW = n * tileW + (n + 1) * gap;
  const x0 = (w - boardW) / 2;
  const y0 = (h - capH - tileH) / 2 - gap;
  const color = toneOf(p.color);
  return (
    <g>
      <Glow id={`fg${uid}`} r={tileW * 0.09} />
      <rect x={f2(x0)} y={f2(y0)} width={f2(boardW)} height={f2(tileH + gap * 2)} rx={f2(gap * 0.8)} fill="#0A1016" opacity={0.92} />
      {chars.map((c, i) => {
        const flip = phase(reveal, (i / n) * 0.55, (i / n) * 0.55 + 0.45);
        const x = x0 + gap + i * (tileW + gap);
        const y = y0 + gap;
        // The top flap folds down over the new character: 1 → 0 → (shows the char).
        const fold = Math.cos(Math.PI * Math.min(1, flip));
        const shown = flip >= 0.5;
        return (
          <g key={i} transform={`translate(${f2(x)} ${f2(y)})`}>
            <rect width={f2(tileW)} height={f2(tileH / 2 - 1)} rx={f2(tileW * 0.06)} fill={NIGHT.tileTop} />
            <rect y={f2(tileH / 2 + 1)} width={f2(tileW)} height={f2(tileH / 2 - 1)} rx={f2(tileW * 0.06)} fill={NIGHT.tileBottom} />
            {shown && c !== " " ? (
              <text x={f2(tileW / 2)} y={f2(tileH * 0.82)} textAnchor="middle" fontFamily={CATCH_FONTS.numbers} fontWeight={900} fontSize={f2(tileH * 0.92)} fill={color} filter={`url(#fg${uid})`}>
                {c}
              </text>
            ) : null}
            {flip > 0 && flip < 1 ? (
              <rect y={f2(fold > 0 ? tileH / 2 - (tileH / 2) * fold : tileH / 2)} width={f2(tileW)} height={f2((tileH / 2) * Math.abs(fold))} fill={fold > 0 ? NIGHT.tileTop : NIGHT.tileBottom} opacity={0.95} />
            ) : null}
            <line x1={0} x2={f2(tileW)} y1={f2(tileH / 2)} y2={f2(tileH / 2)} stroke="#05080B" strokeWidth={f2(Math.max(1.5, tileH * 0.012))} />
          </g>
        );
      })}
      {p.caption ? (
        <text x={f2(w / 2)} y={f2(h - capH * 0.25)} textAnchor="middle" fontFamily={CATCH_FONTS.mono} fontWeight={600} fontSize={f2(capH * 0.55)} letterSpacing={f2(capH * 0.08)} fill={alpha(NIGHT.paper, 0.75 * phase(reveal, 0.6, 1))}>
          {p.caption.toUpperCase()}
        </text>
      ) : null}
    </g>
  );
};

/** A small person: round head, shoulders. Lit ones hold up a glowing card. */
const Person: React.FC<{ x: number; y: number; s: number; lit: number; bob: number }> = ({ x, y, s, lit, bob }) => {
  const body = lit > 0 ? NIGHT.sodium : "#2A3B46";
  return (
    <g transform={`translate(${f2(x)} ${f2(y + bob)})`}>
      <circle cy={f2(-s * 0.95)} r={f2(s * 0.28)} fill={body} opacity={lit > 0 ? 0.35 + 0.65 * lit : 1} />
      <path d={`M${f2(-s * 0.42)},0 C${f2(-s * 0.42)},${f2(-s * 0.62)} ${f2(s * 0.42)},${f2(-s * 0.62)} ${f2(s * 0.42)},0Z`} fill={body} opacity={lit > 0 ? 0.35 + 0.65 * lit : 1} />
      {lit > 0 ? <rect x={f2(s * 0.18)} y={f2(-s * 0.98)} width={f2(s * 0.34)} height={f2(s * 0.22)} rx={f2(s * 0.04)} fill={NIGHT.paper} opacity={lit} transform={`rotate(-12 ${f2(s * 0.35)} ${f2(-s * 0.87)})`} /> : null}
    </g>
  );
};

/** A crowd of `count` people on rows; `lit` of them (in a seeded order) light up holding a card. */
export const Crowd: React.FC<DrawProps<CrowdP>> = ({ p, w, h, reveal, t }) => {
  const uid = uidOf(useId());
  const capH = p.caption ? h * 0.14 : 0;
  const cols = Math.ceil(p.count / p.rows);
  const cell = Math.min(w / cols, (h - capH) / p.rows / 1.05);
  const order = Array.from({ length: p.count }, (_, i) => i).sort((a, b) => rand(p.seed, a) - rand(p.seed, b));
  const rank = new Map(order.map((idx, r) => [idx, r]));
  const on = phase(reveal, 0, 1);
  return (
    <g>
      <Glow id={`cg${uid}`} r={cell * 0.12} />
      <g filter={`url(#cg${uid})`}>
        {Array.from({ length: p.count }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = (w - cols * cell) / 2 + (col + 0.5 + (row % 2) * 0.25) * cell;
          const y = (h - capH - p.rows * cell) / 2 + (row + 1) * cell;
          const r = rank.get(i)!;
          const lit = Math.max(0, Math.min(1, p.lit - r));
          const appear = phase(on, (row / p.rows) * 0.6, (row / p.rows) * 0.6 + 0.4);
          const bob = Math.sin(t * 2.2 + i * 1.7) * cell * 0.02 + (1 - appear) * cell * 0.4;
          return appear > 0 ? (
            <g key={i} opacity={appear}>
              <Person x={x} y={y} s={cell * 0.92} lit={lit} bob={bob} />
            </g>
          ) : null;
        })}
      </g>
      {p.caption ? (
        <text x={f2(w / 2)} y={f2(h - capH * 0.2)} textAnchor="middle" fontFamily={CATCH_FONTS.mono} fontWeight={600} fontSize={f2(capH * 0.55)} letterSpacing={f2(capH * 0.08)} fill={alpha(NIGHT.paper, 0.75)}>
          {p.caption.toUpperCase()}
        </text>
      ) : null}
    </g>
  );
};

/** A rubber stamp that slams in (big → overshoot → settle) with a worn, inked edge. */
export const Stamp: React.FC<DrawProps<StampP>> = ({ p, w, h, reveal }) => {
  const uid = uidOf(useId());
  const color = toneOf(p.color);
  const slam = reveal < 1 ? 2.4 - 1.4 * easeOutBack(Math.min(1, reveal / 0.7), 2.2) : 1;
  const fs = Math.min(h * (p.sub ? 0.46 : 0.56), (w * 0.86) / Math.max(4, p.text.length * 0.62));
  const bw = Math.min(w, p.text.length * fs * 0.66 + fs * 0.9);
  const bh = fs * (p.sub ? 1.75 : 1.35);
  const sw = fs * 0.09;
  const holes = Array.from({ length: 46 }, (_, i) => ({ x: rand(`stamp-${p.text}`, `x${i}`) * bw - bw / 2, y: rand(`stamp-${p.text}`, `y${i}`) * bh - bh / 2, r: (0.2 + rand(`stamp-${p.text}`, `r${i}`)) * sw * 0.7 }));
  return (
    <g transform={`translate(${f2(w / 2)} ${f2(h / 2)}) rotate(${f2(p.angle)}) scale(${f2(slam)})`} opacity={Math.min(1, reveal * 3)}>
      <defs>
        <mask id={`sm${uid}`} maskUnits="userSpaceOnUse" x={f2(-bw)} y={f2(-bh)} width={f2(bw * 2)} height={f2(bh * 2)}>
          <rect x={f2(-bw)} y={f2(-bh)} width={f2(bw * 2)} height={f2(bh * 2)} fill="#fff" />
          {holes.map((o, i) => (
            <circle key={i} cx={f2(o.x)} cy={f2(o.y)} r={f2(o.r)} fill="#000" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#sm${uid})`}>
        <rect x={f2(-bw / 2)} y={f2(-bh / 2)} width={f2(bw)} height={f2(bh)} rx={f2(sw * 1.4)} fill="none" stroke={color} strokeWidth={f2(sw)} />
        <rect x={f2(-bw / 2 + sw * 1.6)} y={f2(-bh / 2 + sw * 1.6)} width={f2(bw - sw * 3.2)} height={f2(bh - sw * 3.2)} rx={f2(sw)} fill="none" stroke={color} strokeWidth={f2(sw * 0.4)} />
        <text y={f2(p.sub ? -fs * 0.02 : fs * 0.34)} textAnchor="middle" fontFamily={CATCH_FONTS.display} fontWeight={800} fontSize={f2(fs)} fill={color} letterSpacing={f2(fs * 0.02)}>
          {p.text.toUpperCase()}
        </text>
        {p.sub ? (
          <text y={f2(fs * 0.55)} textAnchor="middle" fontFamily={CATCH_FONTS.mono} fontWeight={600} fontSize={f2(fs * 0.24)} fill={color} letterSpacing={f2(fs * 0.04)}>
            {p.sub.toUpperCase()}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** A key-phrase card: 1–3 lines in Bricolage, each rising in on its own beat, Sodium lines glowing. */
export const Phrase: React.FC<DrawProps<PhraseP>> = ({ p, w, h, reveal }) => {
  const uid = uidOf(useId());
  const n = p.lines.length;
  const fs = Math.min(h * p.size, (h / n) * 0.9);
  const widest = Math.max(...p.lines.map((l) => l.text.length));
  const size = Math.min(fs, (w / Math.max(1, widest)) * 1.9);
  const lineH = size * 1.06;
  const top = (h - lineH * n) / 2 + size * 0.82;
  const x = p.align === "middle" ? w / 2 : 0;
  const plateW = Math.min(w, widest * size * 0.56) + size * 0.8;
  return (
    <g>
      <Glow id={`pg${uid}`} r={size * 0.12} />
      {p.plate ? (
        <rect x={f2((p.align === "middle" ? w / 2 - plateW / 2 : 0) - size * 0.4)} y={f2(top - size * 1.05)} width={f2(plateW)} height={f2(lineH * n + size * 0.5)} rx={f2(size * 0.25)} fill={alpha(NIGHT.night, 0.82 * Math.min(1, reveal * 3))} />
      ) : null}
      {p.lines.map((l, i) => {
        const u = easeOutCubic(phase(reveal, (i / n) * 0.55, (i / n) * 0.55 + 0.45));
        const color = toneOf(l.color);
        return u > 0 ? (
          <text
            key={i}
            x={f2(x)}
            y={f2(top + i * lineH + (1 - u) * size * 0.35)}
            textAnchor={p.align === "middle" ? "middle" : "start"}
            fontFamily={CATCH_FONTS.display}
            fontWeight={800}
            fontSize={f2(size)}
            letterSpacing={f2(-size * 0.02)}
            fill={color}
            opacity={u}
            stroke={alpha(NIGHT.night, 0.55)}
            strokeWidth={f2(size * 0.08)}
            paintOrder="stroke"
            filter={l.color === "paper" ? undefined : `url(#pg${uid})`}
          >
            {l.text}
          </text>
        ) : null;
      })}
    </g>
  );
};
