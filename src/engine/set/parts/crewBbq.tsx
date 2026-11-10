/**
 * The `crew` kit's backyard BBQ (the relatable three-person channel), at the train's detail level:
 * sky with drifting clouds, trees over a timber fence, string lights, a shade umbrella and lawn.
 * Furniture: `crew-camp-chair` (a seat, profile), `crew-bbq-grill` (smoke rising), `crew-esky` and
 * `crew-bbq-near` (foreground). Palette tokens only (`crew-bbq`); ambient motion runs off the frame.
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import { SEAT_HEIGHT } from "./seats";
import { edge, flipAt, partBase, partX, SET_LINE, type PartComponent } from "./types";

const FPS = 30;// ─── Backyard BBQ ────────────────────────────────────────────────────────────────────────────

export const CrewBackyard: PartComponent = ({ palette: pal, W, H, groundY, fig, seed, prefix, frame = 0 }) => {
  const t = frame / FPS;
  const grad = `${prefix}-sky`;
  const fenceTop = groundY - fig * 0.95;
  const s = pal.scenery ?? { far: mix(pal.sky, pal.detail, 0.3), mid: pal.detail, near: darken(pal.detail, 0.15), ground: pal.floor };
  const timber = pal.wallB;
  const sunX = W * 0.8;
  const sunY = H * 0.1;
  const glow = pal.glow ?? pal.accent;
  // String lights: a sagging wire between two posts with bulbs that twinkle slowly.
  const wire = { x0: -W * 0.02, x1: W * 1.02, y: H * 0.2, sag: H * 0.05 };
  const wireY = (u: number) => wire.y + wire.sag * 4 * u * (1 - u);
  const cloud = (cx: number, cy: number, k: number) => (
    <g fill={lighten(pal.sky, 0.8)}>
      <ellipse cx={f2(cx)} cy={f2(cy)} rx={f2(W * 0.12 * k)} ry={f2(H * 0.022 * k)} />
      <ellipse cx={f2(cx + W * 0.06 * k)} cy={f2(cy - H * 0.015 * k)} rx={f2(W * 0.07 * k)} ry={f2(H * 0.022 * k)} />
    </g>
  );
  const drift = (base: number, speed: number) => ((((base + speed * t) % (W * 1.4)) + W * 1.4) % (W * 1.4)) - W * 0.2;
  const ridge = (key: string, top: number, amp: number, n: number) => {
    const pts = Array.from({ length: n + 1 }, (_, i) => `${f2((W * 1.1 * i) / n - W * 0.05)},${f2(top + amp * rand(seed, `${key}${i}`))}`);
    return `M ${f2(-W * 0.05)} ${f2(fenceTop + fig * 0.1)} L ${pts.join(" L ")} L ${f2(W * 1.05)} ${f2(fenceTop + fig * 0.1)} Z`;
  };
  return (
    <g>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky} />
          <stop offset="1" stopColor={lighten(pal.sky, 0.5)} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${grad})`} />
      <circle cx={f2(sunX)} cy={f2(sunY)} r={W * 0.11} fill={glow} opacity={0.25} />
      <circle cx={f2(sunX)} cy={f2(sunY)} r={W * 0.06} fill={glow} />
      {cloud(drift(W * 0.15, 10), H * 0.07, 1)}
      {cloud(drift(W * 0.75, 7), H * 0.14, 0.75)}
      {/* Far hills and the neighbours' trees (a gentle sway). */}
      <path d={ridge("hill", fenceTop - fig * 0.35, fig * 0.12, 6)} fill={s.far} />
      {[0.08, 0.27, 0.62, 0.9].map((k, i) => {
        const r = fig * (0.22 + 0.06 * rand(seed, `tr${i}`));
        const x = W * k;
        const sway = 2 * noise(seed, `ts${i}`, t * 0.4);
        return (
          <g key={k} transform={`rotate(${f2(sway)} ${f2(x)} ${f2(fenceTop)})`}>
            <rect x={f2(x - r * 0.1)} y={f2(fenceTop - r * 0.8)} width={f2(r * 0.2)} height={f2(r * 0.9)} fill={darken(s.near, 0.3)} />
            <circle cx={f2(x)} cy={f2(fenceTop - r * 1.05)} r={f2(r * 0.62)} fill={i % 2 ? s.mid : s.near} />
            <circle cx={f2(x - r * 0.4)} cy={f2(fenceTop - r * 0.75)} r={f2(r * 0.45)} fill={i % 2 ? s.near : s.mid} />
            <circle cx={f2(x + r * 0.42)} cy={f2(fenceTop - r * 0.8)} r={f2(r * 0.42)} fill={s.mid} />
          </g>
        );
      })}
      {/* Timber fence: palings with a top rail. */}
      <rect x={0} y={f2(fenceTop)} width={W} height={f2(groundY - fenceTop)} fill={timber} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={f2((W * i) / 12)} x2={f2((W * i) / 12)} y1={f2(fenceTop)} y2={f2(groundY)} stroke={darken(timber, 0.14)} strokeWidth={4} />
      ))}
      <rect x={0} y={f2(fenceTop - fig * 0.02)} width={W} height={fig * 0.035} fill={darken(timber, 0.08)} />
      <rect x={0} y={f2(fenceTop + fig * 0.35)} width={W} height={fig * 0.025} fill={darken(timber, 0.08)} />
      {/* A climbing plant on the fence. */}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={f2(W * (0.38 + 0.03 * i))} cy={f2(fenceTop + fig * (0.05 + 0.05 * Math.abs(3 - i)))} r={f2(fig * 0.05)} fill={i % 2 ? s.near : s.mid} />
      ))}
      {/* Shade umbrella behind the cast, right of centre. */}
      <rect x={f2(W * 0.84 - 5)} y={f2(H * 0.29)} width={10} height={f2(groundY - H * 0.29)} fill={darken(pal.shade, 0.1)} />
      <path d={`M ${f2(W * 0.6)} ${f2(H * 0.33)} Q ${f2(W * 0.84)} ${f2(H * 0.24)} ${f2(W * 1.08)} ${f2(H * 0.33)} Z`} fill={pal.accent} stroke={edge(pal.accent)} strokeWidth={SET_LINE} />
      {[0.68, 0.76, 0.84, 0.92, 1.0].map((k, i) => (
        <path key={k} d={`M ${f2(W * k)} ${f2(H * 0.33)} q ${f2(W * 0.04)} ${f2(H * 0.012)} ${f2(W * 0.08)} 0`} fill={i % 2 ? lighten(pal.wallA, 0.4) : pal.accent} stroke={edge(pal.accent)} strokeWidth={2} />
      ))}
      {/* String lights. */}
      <path d={`M ${f2(wire.x0)} ${f2(wire.y)} Q ${f2(W / 2)} ${f2(wire.y + wire.sag * 2)} ${f2(wire.x1)} ${f2(wire.y)}`} fill="none" stroke={darken(pal.shade, 0.3)} strokeWidth={3} />
      {Array.from({ length: 11 }, (_, i) => {
        const u = (i + 0.5) / 11;
        const x = wire.x0 + (wire.x1 - wire.x0) * u;
        const y = wireY(u);
        const on = 0.75 + 0.25 * Math.sin(t * 2 + i * 1.3);
        return (
          <g key={i}>
            <circle cx={f2(x)} cy={f2(y + 16)} r={18} fill={glow} opacity={0.25 * on} />
            <ellipse cx={f2(x)} cy={f2(y + 14)} rx={8} ry={11} fill={[glow, pal.accent, lighten(pal.detail, 0.3)][i % 3]} opacity={on} stroke={darken(pal.shade, 0.3)} strokeWidth={2} />
          </g>
        );
      })}
      {/* Lawn with a few tufts, then a paved strip under the cast. */}
      <rect x={0} y={f2(groundY)} width={W} height={f2(H - groundY)} fill={s.ground} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = W * rand(seed, `g${i}`);
        const y = groundY + (H - groundY) * (0.2 + 0.7 * rand(seed, `gy${i}`));
        return <path key={i} d={`M ${f2(x - 8)} ${f2(y)} l 6 -16 l 4 14 l 6 -12 l 3 14`} fill="none" stroke={darken(s.ground, 0.18)} strokeWidth={3} strokeLinecap="round" />;
      })}
      <rect x={0} y={f2(groundY)} width={W} height={fig * 0.03} fill={darken(s.ground, 0.12)} />
    </g>
  );
};

/** A folding camp chair in profile for a sitter facing right (backrest on the left); `flip` for facing left. */
export const CrewCampChair: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const seatTop = base - SEAT_HEIGHT["crew-camp-chair"] * s;
  const fabric = pal.detail;
  const metal = darken(pal.shade, 0.25);
  const leg = f2(s * 0.014);
  return (
    <g transform={flipAt(part.flip, cx)} strokeLinejoin="round" strokeLinecap="round">
      {/* Crossed legs. */}
      <line x1={f2(cx - s * 0.17)} y1={f2(base)} x2={f2(cx + s * 0.12)} y2={f2(seatTop)} stroke={metal} strokeWidth={leg} />
      <line x1={f2(cx + s * 0.12)} y1={f2(base)} x2={f2(cx - s * 0.17)} y2={f2(seatTop)} stroke={metal} strokeWidth={leg} />
      {/* Back frame leaning back, fabric back and sling seat, armrest with a cup. */}
      <line x1={f2(cx - s * 0.17)} y1={f2(seatTop)} x2={f2(cx - s * 0.22)} y2={f2(seatTop - s * 0.36)} stroke={metal} strokeWidth={leg} />
      <path d={`M ${f2(cx - s * 0.165)} ${f2(seatTop - s * 0.02)} L ${f2(cx - s * 0.21)} ${f2(seatTop - s * 0.34)} L ${f2(cx - s * 0.14)} ${f2(seatTop - s * 0.34)} L ${f2(cx - s * 0.11)} ${f2(seatTop - s * 0.02)} Z`} fill={fabric} stroke={edge(fabric)} strokeWidth={SET_LINE} />
      <path d={`M ${f2(cx - s * 0.17)} ${f2(seatTop - s * 0.02)} Q ${f2(cx - s * 0.02)} ${f2(seatTop + s * 0.04)} ${f2(cx + s * 0.13)} ${f2(seatTop - s * 0.02)} L ${f2(cx + s * 0.13)} ${f2(seatTop + s * 0.02)} Q ${f2(cx - s * 0.02)} ${f2(seatTop + s * 0.08)} ${f2(cx - s * 0.17)} ${f2(seatTop + s * 0.02)} Z`} fill={darken(fabric, 0.08)} stroke={edge(fabric)} strokeWidth={SET_LINE} />
      <line x1={f2(cx - s * 0.18)} y1={f2(seatTop - s * 0.12)} x2={f2(cx + s * 0.1)} y2={f2(seatTop - s * 0.12)} stroke={metal} strokeWidth={leg} />
      <line x1={f2(cx + s * 0.1)} y1={f2(seatTop - s * 0.12)} x2={f2(cx + s * 0.12)} y2={f2(seatTop)} stroke={metal} strokeWidth={leg} />
    </g>
  );
};

/** A kettle-style BBQ grill with a lifted hood, sausages and rising smoke (foreground, in front of the cook). */
export const CrewBbqGrill: PartComponent = ({ part, palette: pal, W, H, groundY, fig, seed, marks, frame = 0 }) => {
  const t = frame / FPS;
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const top = base - s * 0.44;
  const w = s * 0.34;
  const body = darken(pal.shade, 0.45);
  const ember = pal.glow ?? pal.accent;
  // Smoke: puffs rise, drift and fade on a loop.
  const puffs = Array.from({ length: 6 }, (_, i) => {
    const life = 3;
    const u = ((t + (i * life) / 6) % life) / life;
    const x = cx + w * (0.15 + 0.2 * rand(seed, `p${i}`)) + Math.sin(t * 1.5 + i) * s * 0.012;
    const y = top - s * 0.05 - u * s * 0.28;
    return <circle key={i} cx={f2(x)} cy={f2(y)} r={f2(s * (0.02 + 0.035 * u))} fill={lighten(pal.wallA, 0.6)} opacity={f2(0.75 * (1 - u))} />;
  });
  return (
    <g strokeLinejoin="round">
      {puffs}
      {/* Legs and side shelf. */}
      {[-0.35, 0.35].map((k) => (
        <rect key={k} x={f2(cx + k * w - s * 0.012)} y={f2(top + s * 0.1)} width={f2(s * 0.024)} height={f2(base - top - s * 0.1)} fill={body} stroke={edge(body)} strokeWidth={SET_LINE} />
      ))}
      <rect x={f2(cx + w * 0.5)} y={f2(top + s * 0.02)} width={f2(s * 0.12)} height={f2(s * 0.022)} rx={4} fill={pal.wallB} stroke={edge(pal.wallB)} strokeWidth={SET_LINE} />
      {/* Lifted hood behind the grill (seen from the side), open towards the cook. */}
      <path d={`M ${f2(cx - w * 0.5)} ${f2(top)} q ${f2(-s * 0.06)} ${f2(-s * 0.16)} ${f2(s * 0.03)} ${f2(-s * 0.24)} l ${f2(s * 0.03)} ${f2(s * 0.02)} q ${f2(-s * 0.06)} ${f2(s * 0.1)} ${f2(-s * 0.02)} ${f2(s * 0.22)} Z`} fill={pal.accent} stroke={edge(pal.accent, 0.25)} strokeWidth={SET_LINE} />
      {/* Sausages on the grate with a glow under them. */}
      <ellipse cx={f2(cx)} cy={f2(top)} rx={f2(w * 0.45)} ry={f2(s * 0.025)} fill={ember} opacity={0.6 + 0.2 * Math.sin(t * 4)} />
      {[-0.28, -0.08, 0.12, 0.32].map((k, i) => (
        <rect key={k} x={f2(cx + k * w - s * 0.035)} y={f2(top - s * 0.025)} width={f2(s * 0.07)} height={f2(s * 0.022)} rx={f2(s * 0.011)} fill={darken(pal.accent, 0.35 + 0.05 * (i % 2))} stroke={edge(pal.accent, 0.5)} strokeWidth={2} />
      ))}
      {/* Bowl. */}
      <path d={`M ${f2(cx - w * 0.5)} ${f2(top)} H ${f2(cx + w * 0.5)} Q ${f2(cx + w * 0.48)} ${f2(top + s * 0.14)} ${f2(cx)} ${f2(top + s * 0.15)} Q ${f2(cx - w * 0.48)} ${f2(top + s * 0.14)} ${f2(cx - w * 0.5)} ${f2(top)} Z`} fill={pal.accent} stroke={edge(pal.accent, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w * 0.52)} y={f2(top - s * 0.006)} width={f2(w * 1.04)} height={f2(s * 0.014)} rx={3} fill={darken(pal.shade, 0.2)} />
      <circle cx={f2(cx)} cy={f2(top + s * 0.07)} r={f2(s * 0.016)} fill={lighten(pal.wallA, 0.4)} />
      {/* Gas bottle under the shelf. */}
      <rect x={f2(cx + w * 0.55)} y={f2(base - s * 0.16)} width={f2(s * 0.08)} height={f2(s * 0.16)} rx={f2(s * 0.03)} fill={pal.detail} stroke={edge(pal.detail)} strokeWidth={SET_LINE} />
    </g>
  );
};

/** A cooler box ("esky") on the lawn (foreground), with a can on the lid. */
export const CrewEsky: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const w = s * 0.3;
  const h = s * 0.18;
  const box = pal.detail;
  return (
    <g strokeLinejoin="round">
      <rect x={f2(cx - w / 2)} y={f2(base - h)} width={f2(w)} height={f2(h)} rx={f2(s * 0.02)} fill={box} stroke={edge(box)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w * 0.52)} y={f2(base - h - s * 0.035)} width={f2(w * 1.04)} height={f2(s * 0.045)} rx={f2(s * 0.015)} fill={lighten(pal.wallA, 0.5)} stroke={edge(pal.wallA, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w * 0.15)} y={f2(base - h + s * 0.03)} width={f2(w * 0.3)} height={f2(s * 0.025)} rx={4} fill={darken(box, 0.2)} />
      <rect x={f2(cx + w * 0.15)} y={f2(base - h - s * 0.1)} width={f2(s * 0.04)} height={f2(s * 0.065)} rx={4} fill={pal.accent} stroke={edge(pal.accent)} strokeWidth={SET_LINE} />
    </g>
  );
};

/** The near edge of a picnic table (foreground) with plates, sauce and drinks, for depth in a wide shot. */
export const CrewBbqNear: PartComponent = ({ palette: pal, W, H }) => {
  const top = H * 0.87;
  const wood = pal.wallB;
  const plate = (x: number, i: number) => (
    <g key={i}>
      <ellipse cx={f2(x)} cy={f2(top + H * 0.004)} rx={f2(W * 0.075)} ry={f2(H * 0.01)} fill={lighten(pal.wallA, 0.6)} stroke={edge(pal.wallA, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(x - W * 0.045)} y={f2(top - H * 0.014)} width={f2(W * 0.09)} height={f2(H * 0.016)} rx={f2(H * 0.008)} fill={mix(pal.glow ?? pal.wallA, pal.wallB, 0.4)} stroke={edge(pal.wallB, 0.3)} strokeWidth={2} />
      <rect x={f2(x - W * 0.04)} y={f2(top - H * 0.018)} width={f2(W * 0.08)} height={f2(H * 0.008)} rx={f2(H * 0.004)} fill={darken(pal.accent, 0.35)} />
    </g>
  );
  return (
    <g strokeLinejoin="round">
      <rect x={-20} y={f2(top)} width={W + 40} height={f2(H - top + 20)} fill={wood} stroke={edge(wood)} strokeWidth={SET_LINE} />
      {[0.33, 0.66].map((k) => (
        <line key={k} x1={0} x2={W} y1={f2(top + (H - top) * k)} y2={f2(top + (H - top) * k)} stroke={darken(wood, 0.14)} strokeWidth={4} />
      ))}
      {[0.14, 0.86].map(plate)}
      {/* Sauce bottle and two cans. */}
      <rect x={f2(W * 0.3)} y={f2(top - H * 0.05)} width={f2(W * 0.035)} height={f2(H * 0.05)} rx={8} fill={pal.accent} stroke={edge(pal.accent, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(W * 0.307)} y={f2(top - H * 0.062)} width={f2(W * 0.02)} height={f2(H * 0.014)} rx={4} fill={lighten(pal.wallA, 0.3)} stroke={edge(pal.wallA, 0.3)} strokeWidth={2} />
      {[0.62, 0.68].map((k, i) => (
        <rect key={k} x={f2(W * k)} y={f2(top - H * 0.032)} width={f2(W * 0.03)} height={f2(H * 0.032)} rx={5} fill={i ? pal.detail : pal.glow ?? pal.accent} stroke={edge(pal.detail, 0.25)} strokeWidth={SET_LINE} />
      ))}
    </g>
  );
};
