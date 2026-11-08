/** Time and the Moon's brake: `clock`, `growth` (a shell or coral that keeps a diary), `earthmoon`. */
import React from "react";
import { mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import type { ClockP, EarthMoonP, GrowthP } from "../paramsTime";
import { resolveColor } from "../theme";
import { Arrow, phase, Txt, type DrawProps } from "./common";
import { Earth } from "./globe";

const RAD = Math.PI / 180;
const MONO = "IBM Plex Mono, ui-monospace, monospace";

/** A clock face; `time` in hours sweeps the hands, a wedge shades part of the dial. */
export const Clock: React.FC<DrawProps<ClockP>> = ({ p, w, h, theme, reveal, t, unit, fontFamily }) => {
  const sw = theme.stroke * unit;
  const faceH = p.digital ? h * 0.74 : h;
  const r = Math.min(w, faceH) * 0.46;
  const cx = w / 2;
  const cy = faceH / 2;
  const time = p.time + p.speed * t;
  const at = (turns: number, len: number) => ({ x: cx + len * Math.sin(turns * 2 * Math.PI), y: cy - len * Math.cos(turns * 2 * Math.PI) });
  const hourTurns = (time % p.dial) / p.dial;
  const hands = [
    { turns: hourTurns, len: r * 0.52, width: sw * 1.3, color: theme.ink },
    { turns: time % 1, len: r * 0.78, width: sw * 0.85, color: theme.ink },
    ...(p.seconds ? [{ turns: ((time * 3600) % 60) / 60, len: r * 0.84, width: sw * 0.4, color: theme.myth }] : []),
  ];
  const n = p.dial === 24 ? 24 : 60;
  const ticks = Array.from({ length: n }, (_, i) => {
    const major = p.dial === 24 ? i % 6 === 0 : i % 5 === 0;
    const a = at(i / n, r * 0.94);
    const b = at(i / n, r * (major ? 0.8 : 0.88));
    return <line key={i} x1={f2(a.x)} y1={f2(a.y)} x2={f2(b.x)} y2={f2(b.y)} stroke={theme.ink} strokeWidth={f2(sw * (major ? 0.6 : 0.25))} strokeLinecap="round" />;
  });
  const nums = p.dial === 24 ? [24, 6, 12, 18] : [12, 3, 6, 9];
  const wedge = p.wedge;
  const wedgePath = (() => {
    if (!wedge) return "";
    const a0 = wedge.from / p.dial;
    const a1 = a0 + ((wedge.to - wedge.from) / p.dial) * wedge.fill * phase(reveal, 0.5, 1);
    const pts = Array.from({ length: 33 }, (_, i) => at(a0 + ((a1 - a0) * i) / 32, r * 0.92));
    return `M ${f2(cx)} ${f2(cy)} L ${pts.map((q) => `${f2(q.x)} ${f2(q.y)}`).join(" L ")} Z`;
  })();
  const wedgeCol = wedge ? resolveColor(theme, wedge.color, theme.myth) : theme.myth;
  const wedgeMid = wedge ? at((wedge.from + wedge.to) / 2 / p.dial, r * 1.18) : undefined;
  return (
    <g>
      <circle cx={f2(cx)} cy={f2(cy)} r={f2(r)} fill={theme.paper} stroke={theme.ink} strokeWidth={f2(sw * 0.9)} />
      {wedgePath ? <path d={wedgePath} fill={wedgeCol} opacity={0.45} /> : null}
      {ticks}
      {nums.map((v, i) => {
        const q = at(i / 4, r * 0.64);
        return <Txt key={v} x={q.x} y={q.y} size={r * 0.17} color={theme.ink} halo={theme.paper} weight={800} fontFamily={fontFamily}>{String(v)}</Txt>;
      })}
      {hands.map((hd, i) => {
        const q = at(hd.turns, hd.len);
        return <line key={i} x1={f2(cx)} y1={f2(cy)} x2={f2(q.x)} y2={f2(q.y)} stroke={hd.color} strokeWidth={f2(hd.width)} strokeLinecap="round" />;
      })}
      <circle cx={f2(cx)} cy={f2(cy)} r={f2(sw * 1.1)} fill={theme.ink} />
      {wedge?.label && wedgeMid ? <Txt x={wedgeMid.x} y={wedgeMid.y} size={r * 0.15} color={wedgeCol} halo={theme.paper} weight={800} fontFamily={fontFamily}>{wedge.label}</Txt> : null}
      {p.digital ? (
        <g>
          <rect x={f2(cx - r * 0.95)} y={f2(faceH + h * 0.02)} width={f2(r * 1.9)} height={f2(h * 0.22)} rx={f2(h * 0.03)} fill={mix(theme.ink, theme.paper, 0.08)} />
          <Txt x={cx} y={faceH + h * 0.13} size={h * 0.15} color={resolveColor(theme, p.digitalColor, theme.highlight)} halo={mix(theme.ink, theme.paper, 0.08)} weight={700} fontFamily={MONO}>{p.digital}</Txt>
        </g>
      ) : null}
    </g>
  );
};

/** A cup-shaped rudist or a horn coral growing from its tip, one line a day. */
export const Growth: React.FC<DrawProps<GrowthP> & { id: string }> = ({ p, w, h, theme, reveal, unit, fontFamily, id }) => {
  const sw = theme.stroke * unit;
  const col = resolveColor(theme, p.color, theme.highlight);
  const shell = mix(col, theme.paper, 0.55);
  const bodyW = p.lens > 0 ? w * 0.55 : w;
  const top = h * 0.08;
  const tip = h * 0.96;
  const half = (s: number) => bodyW * 0.36 * (0.07 + 0.93 * Math.pow(s, 0.75));
  const mid = (s: number) => ({
    x: bodyW / 2 + (p.shape === "coral" ? bodyW * 0.34 * Math.pow(1 - s, 2) - bodyW * 0.12 : 0),
    y: tip - s * (tip - top),
  });
  const grown = Math.min(1, (p.lines / p.total) * Math.min(1, reveal * 1.5));
  const steps = 40;
  const side = (sign: number) => Array.from({ length: steps + 1 }, (_, i) => {
    const s = (grown * i) / steps;
    const c = mid(s);
    return { x: c.x + sign * half(s), y: c.y };
  });
  const left = side(-1);
  const right = side(1).reverse();
  const outline = `M ${[...left, ...right].map((q) => `${f2(q.x)} ${f2(q.y)}`).join(" L ")} Z`;
  const shown = Math.floor(Math.min(p.lines, p.total) * Math.min(1, reveal * 1.5));
  const lineAt = (i: number) => {
    const s = i / p.total;
    const c = mid(s);
    const hw = half(s);
    const yearly = p.yearEvery > 0 && i % p.yearEvery === 0;
    return <path key={i} d={`M ${f2(c.x - hw)} ${f2(c.y)} Q ${f2(c.x)} ${f2(c.y + hw * 0.22)} ${f2(c.x + hw)} ${f2(c.y)}`} fill="none" stroke={yearly ? theme.ink : mix(theme.ink, shell, 0.45)} strokeWidth={f2(sw * (yearly ? 0.55 : 0.18))} />;
  };
  const rim = mid(grown);
  const lensOn = p.lens * phase(reveal, 0.6, 1);
  const lr = Math.min(w * 0.2, h * 0.24) * (0.6 + 0.4 * lensOn);
  const lx = w * 0.79;
  const ly = h * 0.32;
  return (
    <g>
      <path d={outline} fill={shell} stroke={theme.ink} strokeWidth={f2(sw * 0.7)} strokeLinejoin="round" />
      {Array.from({ length: shown }, (_, i) => lineAt(i + 1))}
      {p.shape === "rudist" && grown > 0.05 ? <ellipse cx={f2(rim.x)} cy={f2(rim.y)} rx={f2(half(grown))} ry={f2(half(grown) * 0.22)} fill={mix(col, theme.ink, 0.35)} stroke={theme.ink} strokeWidth={f2(sw * 0.6)} /> : null}
      {p.tally ? <Txt x={rim.x + half(grown) + w * 0.02} y={rim.y} size={h * 0.07} color={col} halo={theme.paper} anchor="start" weight={800} fontFamily={fontFamily}>{String(shown)}</Txt> : null}
      {lensOn > 0.02 ? (
        <g opacity={lensOn}>
          <line x1={f2(rim.x + half(grown) * 0.6)} y1={f2(rim.y + h * 0.04)} x2={f2(lx - lr)} y2={f2(ly)} stroke={theme.muted} strokeWidth={f2(sw * 0.3)} strokeDasharray={`${f2(sw)} ${f2(sw)}`} />
          <clipPath id={`growth-lens-${id}`}>
            <circle cx={f2(lx)} cy={f2(ly)} r={f2(lr)} />
          </clipPath>
          <g clipPath={`url(#growth-lens-${id})`}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={f2(lx - lr)} y={f2(ly - lr + (i * 2 * lr) / 8)} width={f2(2 * lr)} height={f2((2 * lr) / 8)} fill={i % 2 ? mix(shell, theme.ink, 0.35) : mix(shell, theme.paper, 0.3)} />
            ))}
          </g>
          <circle cx={f2(lx)} cy={f2(ly)} r={f2(lr)} fill="none" stroke={theme.ink} strokeWidth={f2(sw * 0.8)} />
          <Txt x={lx + lr * 1.12} y={ly - lr * 0.75} size={h * 0.045} color={theme.ink} halo={theme.paper} anchor="start" weight={800} fontFamily={fontFamily}>day</Txt>
          <Txt x={lx + lr * 1.12} y={ly - lr * 0.5} size={h * 0.045} color={theme.muted} halo={theme.paper} anchor="start" weight={800} fontFamily={fontFamily}>night</Txt>
        </g>
      ) : null}
    </g>
  );
};

/** The Earth, its tidal bulge dragged ahead of the Moon, the Moon drifting out, and a laser. */
export const EarthMoon: React.FC<DrawProps<EarthMoonP> & { fs: number; id: string }> = ({ p, w, h, theme, reveal, t, unit, fontFamily, fs, id }) => {
  const sw = theme.stroke * unit;
  const ex = w * 0.2;
  const ey = h / 2;
  const er = h * 0.3;
  const R = p.distance * w * 0.7;
  const ma = (p.moonAngle + p.orbit * t) * RAD;
  const mx = ex + R * Math.cos(ma);
  const my = ey - R * Math.sin(ma);
  const mr = er * 0.3;
  const bulgeA = p.moonAngle + p.orbit * t + p.lag;
  const tipA = bulgeA * RAD;
  const tip = { x: ex + er * 1.3 * Math.cos(tipA), y: ey - er * 1.3 * Math.sin(tipA) };
  const on = phase(reveal, 0.3, 1);
  const L = p.laser;
  const out = L <= 0.5 ? L / 0.5 : 1 - (L - 0.5) / 0.5;
  const sx = ex + er * Math.cos(ma);
  const sy = ey - er * Math.sin(ma);
  const px = sx + (mx - mr * Math.cos(ma) - sx) * out;
  const py = sy + (my + mr * Math.sin(ma) - sy) * out;
  const orbitPts = Array.from({ length: 49 }, (_, i) => {
    const a = (-40 + (i / 48) * 80) * RAD + ma;
    return `${f2(ex + R * Math.cos(a))} ${f2(ey - R * Math.sin(a))}`;
  });
  return (
    <g>
      <path d={`M ${orbitPts.join(" L ")}`} fill="none" stroke={theme.muted} strokeWidth={f2(sw * 0.3)} strokeDasharray={`${f2(sw * 1.2)} ${f2(sw * 1.2)}`} opacity={on} />
      {p.bulge > 0 ? (
        <ellipse cx={f2(ex)} cy={f2(ey)} rx={f2(er * (1 + 0.32 * p.bulge))} ry={f2(er * 1.02)} transform={`rotate(${f2(-bulgeA)} ${f2(ex)} ${f2(ey)})`} fill="#7fb3e6" opacity={0.7 * on} stroke="#4a86c5" strokeWidth={f2(sw * 0.4)} />
      ) : null}
      <Earth id={`${id}-earth`} cx={ex} cy={ey} r={er} lon={-p.spin * t} lat={20} theme={theme} unit={unit} t={t} reveal={reveal} night={0.35} />
      <circle cx={f2(mx)} cy={f2(my)} r={f2(mr)} fill="#cfd2d6" stroke={theme.ink} strokeWidth={f2(sw * 0.6)} opacity={on} />
      <circle cx={f2(mx - mr * 0.3)} cy={f2(my - mr * 0.2)} r={f2(mr * 0.22)} fill="#aeb2b8" opacity={on} />
      {p.brake > 0 ? (
        <g opacity={p.brake * on}>
          <Arrow x1={tip.x} y1={tip.y} x2={tip.x + (mx - tip.x) * 0.22} y2={tip.y + (my - tip.y) * 0.22} color={theme.highlight} width={sw * 0.8} />
          <Arrow x1={ex + er * 0.2} y1={ey - er * 1.18} x2={ex - er * 0.45} y2={ey - er * 1.1} color={theme.myth} width={sw * 0.8} />
          <Txt x={ex} y={ey - er * 1.42} size={fs * 0.8} color={theme.myth} halo={theme.paper} weight={800} fontFamily={fontFamily}>brake</Txt>
        </g>
      ) : null}
      {L > 0 && L < 1 ? (
        <g>
          <line x1={f2(sx)} y1={f2(sy)} x2={f2(px)} y2={f2(py)} stroke="#ff5a5a" strokeWidth={f2(sw * 0.5)} opacity={0.7} />
          <circle cx={f2(px)} cy={f2(py)} r={f2(sw * 1.2)} fill="#ffdddd" stroke="#ff5a5a" strokeWidth={f2(sw * 0.4)} />
        </g>
      ) : null}
      {p.ruler ? (
        <g opacity={on}>
          <line x1={f2(ex)} y1={f2(ey + er * 1.45)} x2={f2(mx)} y2={f2(ey + er * 1.45)} stroke={theme.ink} strokeWidth={f2(sw * 0.35)} />
          <line x1={f2(mx)} y1={f2(ey + er * 1.3)} x2={f2(mx)} y2={f2(ey + er * 1.6)} stroke={theme.ink} strokeWidth={f2(sw * 0.35)} />
          <Txt x={(ex + mx) / 2} y={ey + er * 1.45 - fs * 0.6} size={fs * 0.85} color={theme.ink} halo={theme.paper} weight={800} fontFamily={fontFamily}>{p.ruler}</Txt>
        </g>
      ) : null}
    </g>
  );
};
