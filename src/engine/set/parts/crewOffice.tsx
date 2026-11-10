/**
 * The `crew` kit's office meeting room (the relatable three-person channel), at the train's detail
 * level: a glass wall onto an open-plan office (coworkers walk past), a wall screen with a live
 * chart, a ticking clock, pendant lights and a plant. Furniture: `crew-office-chair` (a seat,
 * profile), `crew-meeting-table` and `crew-office-near` (foreground), `crew-whiteboard`.
 * Palette tokens only (`crew-office`); ambient motion runs off the composition frame.
 */
import React from "react";
import { darken, lighten, mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { noise, rand } from "../../lib/seed";
import { SEAT_HEIGHT } from "./seats";
import { edge, flipAt, partBase, partX, SET_LINE, type PartComponent } from "./types";

const FPS = 30;

// ─── Meeting room ────────────────────────────────────────────────────────────────────────────

/** Glass band (the open-plan office behind), as fractions of frame height. */
const GLASS = { top: 0.15, bottom: 0.53 } as const;

export const CrewMeetingRoom: PartComponent = ({ palette: pal, W, H, groundY, fig, seed, prefix, frame = 0 }) => {
  const t = frame / FPS;
  const gy0 = H * GLASS.top;
  const gy1 = H * GLASS.bottom;
  const gh = gy1 - gy0;
  const clip = `${prefix}-glass`;
  const panelTop = groundY - fig * 0.42;
  const mullions = [0.02, 0.36, 0.68, 0.98];
  // The office beyond: desks with monitors, a far wall with a window strip, a few coworkers walking.
  const farWall = lighten(pal.wallB, 0.62);
  const deskY = gy0 + gh * 0.72;
  const walker = (i: number) => {
    const speed = W * (0.035 + 0.015 * rand(seed, `w${i}`));
    const dir = i % 2 ? -1 : 1;
    const span = W * 1.4;
    const x0 = W * rand(seed, `wx${i}`) * 1.4;
    const x = ((((x0 + dir * speed * t) % span) + span) % span) - W * 0.2;
    const bob = Math.abs(Math.sin(t * 5 + i)) * gh * 0.012;
    const tall = gh * (0.42 + 0.05 * rand(seed, `wt${i}`));
    const tone = [pal.accent, pal.detail, darken(pal.wallB, 0.15)][i % 3];
    const foot = deskY + gh * 0.16;
    return (
      <g key={i} opacity={0.7}>
        <circle cx={f2(x)} cy={f2(foot - tall - bob)} r={f2(gh * 0.05)} fill={lighten(pal.wallA, 0.3)} stroke={mix(pal.shade, farWall, 0.3)} strokeWidth={3} />
        <rect x={f2(x - gh * 0.045)} y={f2(foot - tall + gh * 0.05 - bob)} width={f2(gh * 0.09)} height={f2(tall - gh * 0.05)} rx={f2(gh * 0.035)} fill={tone} />
      </g>
    );
  };
  // Clock: second hand ticks once a second.
  const clock = { x: W * 0.84, y: H * 0.085, r: W * 0.045 };
  const secA = Math.floor(t) * 6 - 90;
  const minA = (10 + t / 60) * 6 - 90;
  const hand = (deg: number, len: number, w: number, c: string) => (
    <line x1={f2(clock.x)} y1={f2(clock.y)} x2={f2(clock.x + Math.cos((deg * Math.PI) / 180) * len)} y2={f2(clock.y + Math.sin((deg * Math.PI) / 180) * len)} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  // Wall screen chart: the bars breathe a touch (a live dashboard).
  const scr = { x: W * 0.06, y: H * 0.035, w: W * 0.34, h: H * 0.095 };
  const bars = [0.35, 0.55, 0.45, 0.8, 0.62];
  return (
    <g>
      <rect width={W} height={H} fill={pal.wallA} />
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={f2(gy0)} width={W} height={f2(gh)} />
        </clipPath>
      </defs>
      {/* Ceiling with pendant lights. */}
      <rect width={W} height={H * 0.02} fill={lighten(pal.shade, 0.6)} />
      {[0.3, 0.7].map((k) => (
        <g key={k}>
          <line x1={f2(W * k)} x2={f2(W * k)} y1={0} y2={f2(H * 0.11)} stroke={darken(pal.shade, 0.2)} strokeWidth={4} />
          <path d={`M ${f2(W * k - W * 0.07)} ${f2(H * 0.135)} Q ${f2(W * k)} ${f2(H * 0.085)} ${f2(W * k + W * 0.07)} ${f2(H * 0.135)} Z`} fill={pal.accent} stroke={edge(pal.accent)} strokeWidth={SET_LINE} />
          <ellipse cx={f2(W * k)} cy={f2(H * 0.138)} rx={W * 0.04} ry={H * 0.006} fill={lighten(pal.glow ?? pal.wallA, 0.4)} />
        </g>
      ))}
      {/* Wall screen with a chart. */}
      <rect x={f2(scr.x)} y={f2(scr.y)} width={f2(scr.w)} height={f2(scr.h)} rx={10} fill={darken(pal.shade, 0.35)} stroke={edge(darken(pal.shade, 0.35))} strokeWidth={SET_LINE} />
      <rect x={f2(scr.x + scr.w * 0.04)} y={f2(scr.y + scr.h * 0.08)} width={f2(scr.w * 0.92)} height={f2(scr.h * 0.84)} rx={6} fill={lighten(pal.sky, 0.55)} />
      {bars.map((b, i) => {
        const v = b + 0.05 * Math.sin(t * 1.3 + i);
        const bw = (scr.w * 0.8) / bars.length;
        const bh = scr.h * 0.65 * v;
        return <rect key={i} x={f2(scr.x + scr.w * 0.1 + i * bw)} y={f2(scr.y + scr.h * 0.85 - bh)} width={f2(bw * 0.65)} height={f2(bh)} rx={3} fill={i === 3 ? pal.accent : pal.detail} />;
      })}
      {/* Clock. */}
      <circle cx={f2(clock.x)} cy={f2(clock.y)} r={f2(clock.r)} fill={lighten(pal.wallA, 0.5)} stroke={pal.shade} strokeWidth={8} />
      {hand(minA, clock.r * 0.65, 6, darken(pal.shade, 0.4))}
      {hand(secA, clock.r * 0.8, 3, pal.accent)}
      {/* The glass wall: the office beyond, frosted band, mullions, sheen. */}
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={f2(gy0)} width={W} height={f2(gh)} fill={farWall} />
        <rect x={0} y={f2(gy0 + gh * 0.08)} width={W} height={f2(gh * 0.22)} fill={lighten(pal.sky, 0.25)} />
        {[0.2, 0.5, 0.8].map((k) => (
          <rect key={k} x={f2(W * k - 3)} y={f2(gy0 + gh * 0.08)} width={6} height={f2(gh * 0.22)} fill={farWall} />
        ))}
        {[0.12, 0.42, 0.72].map((k, i) => (
          <circle key={k} cx={f2(W * k)} cy={f2(deskY - gh * 0.2)} r={f2(gh * 0.1)} fill={mix(pal.detail, farWall, 0.35)} opacity={i === 1 ? 0 : 1} />
        ))}
        {Array.from({ length: 4 }, (_, i) => walker(i))}
        {/* Desks with monitors, in front of the walkers. */}
        {[0.04, 0.3, 0.56, 0.82].map((k) => (
          <g key={k}>
            <rect x={f2(W * k + W * 0.04)} y={f2(deskY - gh * 0.17)} width={f2(W * 0.09)} height={f2(gh * 0.12)} rx={4} fill={darken(pal.shade, 0.3)} />
            <rect x={f2(W * k + W * 0.08)} y={f2(deskY - gh * 0.05)} width={f2(W * 0.01)} height={f2(gh * 0.05)} fill={darken(pal.shade, 0.3)} />
            <rect x={f2(W * k)} y={f2(deskY)} width={f2(W * 0.2)} height={f2(gh * 0.04)} fill={lighten(pal.wallB, 0.3)} />
            <rect x={f2(W * k + W * 0.01)} y={f2(deskY + gh * 0.04)} width={f2(W * 0.18)} height={f2(gh * 0.2)} fill={lighten(pal.wallB, 0.45)} />
          </g>
        ))}
        {/* Frosted privacy band across the glass. */}
        <rect x={0} y={f2(gy0 + gh * 0.5)} width={W} height={f2(gh * 0.07)} fill={lighten(pal.wallA, 0.6)} opacity={0.75} />
        {[0.08, 0.55].map((k) => (
          <polygon key={k} points={`${f2(W * k)},${f2(gy1)} ${f2(W * (k + 0.12))},${f2(gy0)} ${f2(W * (k + 0.16))},${f2(gy0)} ${f2(W * (k + 0.04))},${f2(gy1)}`} fill={lighten(pal.sky, 0.9)} opacity={0.18} />
        ))}
      </g>
      {mullions.map((k) => (
        <rect key={k} x={f2(W * k - W * 0.008)} y={f2(gy0)} width={f2(W * 0.016)} height={f2(gh)} fill={pal.shade} />
      ))}
      <rect x={0} y={f2(gy0 - H * 0.006)} width={W} height={H * 0.008} fill={pal.shade} />
      <rect x={0} y={f2(gy1)} width={W} height={H * 0.008} fill={pal.shade} />
      {/* Feature wall panel, accent stripe, carpet. */}
      <rect x={0} y={f2(gy1 + H * 0.008)} width={W} height={f2(panelTop - gy1)} fill={pal.wallA} />
      <rect x={0} y={f2(panelTop)} width={W} height={f2(groundY - panelTop)} fill={pal.wallB} />
      <rect x={0} y={f2(panelTop)} width={W} height={fig * 0.03} fill={pal.accent} />
      <rect x={0} y={f2(groundY)} width={W} height={f2(H - groundY)} fill={pal.floor} />
      <rect x={0} y={f2(groundY)} width={W} height={fig * 0.02} fill={darken(pal.floor, 0.12)} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={f2(W * (0.04 + i * 0.07))} cy={f2(groundY + (H - groundY) * (0.35 + 0.25 * (i % 2)))} r={W * 0.005} fill={darken(pal.floor, 0.1)} />
      ))}
      {/* A tall plant in the far right corner, leaves swaying a touch. */}
      <g transform={`rotate(${f2(1.5 * noise(seed, "plant", t * 0.5))} ${f2(W * 0.95)} ${f2(groundY)})`}>
        {[-30, -10, 10, 30, 0].map((a, i) => (
          <ellipse key={i} cx={f2(W * 0.95)} cy={f2(groundY - fig * 0.55)} rx={f2(W * 0.025)} ry={f2(fig * 0.2)} transform={`rotate(${a} ${f2(W * 0.95)} ${f2(groundY - fig * 0.4)})`} fill={i % 2 ? pal.detail : darken(pal.detail, 0.12)} stroke={edge(pal.detail, 0.25)} strokeWidth={SET_LINE} />
        ))}
      </g>
      <path d={`M ${f2(W * 0.92)} ${f2(groundY - fig * 0.2)} h ${f2(W * 0.06)} l ${f2(-W * 0.008)} ${f2(fig * 0.2)} h ${f2(-W * 0.044)} Z`} fill={pal.accent} stroke={edge(pal.accent)} strokeWidth={SET_LINE} />
    </g>
  );
};

/** An office chair in profile for a sitter facing right (backrest on the left); `flip` for facing left. */
export const CrewOfficeChair: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const seatTop = base - SEAT_HEIGHT["crew-office-chair"] * s;
  const fill = pal.detail;
  const metal = darken(pal.shade, 0.25);
  const back = { x0: cx - s * 0.19, x1: cx - s * 0.12, top: base - s * 0.62 };
  return (
    <g transform={flipAt(part.flip, cx)} stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      {/* Gas lift, star base, castors. */}
      <rect x={f2(cx - s * 0.04)} y={f2(seatTop)} width={f2(s * 0.025)} height={f2(base - seatTop - s * 0.03)} fill={metal} />
      <path d={`M ${f2(cx - s * 0.16)} ${f2(base - s * 0.025)} L ${f2(cx - s * 0.03)} ${f2(base - s * 0.045)} L ${f2(cx + s * 0.1)} ${f2(base - s * 0.025)}`} fill="none" stroke={metal} strokeWidth={f2(s * 0.018)} strokeLinecap="round" />
      {[-0.16, 0.1].map((k) => (
        <circle key={k} cx={f2(cx + k * s)} cy={f2(base - s * 0.012)} r={f2(s * 0.014)} fill={darken(metal, 0.2)} />
      ))}
      {/* Backrest on a curved stem. */}
      <path d={`M ${f2(cx - s * 0.03)} ${f2(seatTop + s * 0.02)} Q ${f2(cx - s * 0.16)} ${f2(seatTop + s * 0.02)} ${f2(back.x1 - s * 0.01)} ${f2(seatTop - s * 0.1)}`} fill="none" stroke={metal} strokeWidth={f2(s * 0.016)} />
      <rect x={f2(back.x0)} y={f2(back.top)} width={f2(back.x1 - back.x0)} height={f2(seatTop - s * 0.08 - back.top)} rx={f2(s * 0.035)} fill={fill} />
      {/* Armrest and cushion. */}
      <path d={`M ${f2(cx - s * 0.1)} ${f2(seatTop - s * 0.02)} v ${f2(-s * 0.09)} h ${f2(s * 0.14)}`} fill="none" stroke={metal} strokeWidth={f2(s * 0.014)} strokeLinecap="round" />
      <rect x={f2(back.x0 + s * 0.02)} y={f2(seatTop - s * 0.02)} width={f2(s * 0.32)} height={f2(s * 0.06)} rx={f2(s * 0.03)} fill={lighten(fill, 0.08)} />
    </g>
  );
};

/**
 * The long meeting table (foreground), seen a little from above so its top has depth: the two
 * side sitters' knees go under its ends, and whoever sits at the back (`crew-office-chair-front`)
 * shows from the chest up behind it. A laptop, mugs and a notepad on top.
 */
export const CrewMeetingTable: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const front = base - s * 0.36;
  const back = front - s * 0.09;
  const w = s * 0.66;
  const inset = s * 0.05;
  const wood = mix(pal.wallA, pal.accent, 0.18);
  const legC = darken(pal.shade, 0.2);
  const surfY = (k: number) => front - (front - back) * k;
  return (
    <g strokeLinejoin="round">
      {[-0.44, 0.44].map((k) => (
        <rect key={k} x={f2(cx + k * w - s * 0.014)} y={f2(front)} width={f2(s * 0.028)} height={f2(base - front)} fill={legC} stroke={edge(legC)} strokeWidth={SET_LINE} />
      ))}
      {/* Modesty panel: hides the back sitter's legs. */}
      <rect x={f2(cx - w * 0.3)} y={f2(front)} width={f2(w * 0.6)} height={f2(base - front - s * 0.06)} rx={8} fill={darken(wood, 0.06)} stroke={edge(wood, 0.25)} strokeWidth={SET_LINE} />
      {/* Top surface (a trapezoid for depth), then the front edge. */}
      <path d={`M ${f2(cx - w / 2)} ${f2(front)} L ${f2(cx - w / 2 + inset)} ${f2(back)} L ${f2(cx + w / 2 - inset)} ${f2(back)} L ${f2(cx + w / 2)} ${f2(front)} Z`} fill={lighten(wood, 0.12)} stroke={edge(wood, 0.25)} strokeWidth={SET_LINE} />
      <rect x={f2(cx - w / 2)} y={f2(front)} width={f2(w)} height={f2(s * 0.045)} rx={f2(s * 0.012)} fill={wood} stroke={edge(wood, 0.25)} strokeWidth={SET_LINE} />
      {/* Laptop at the back sitter's place, its lid towards them. */}
      <path d={`M ${f2(cx - s * 0.08)} ${f2(surfY(0.35))} h ${f2(s * 0.16)} l ${f2(-s * 0.012)} ${f2(-s * 0.1)} h ${f2(-s * 0.136)} Z`} fill={lighten(pal.shade, 0.35)} stroke={edge(pal.shade, 0.3)} strokeWidth={SET_LINE} />
      <circle cx={f2(cx)} cy={f2(surfY(0.35) - s * 0.05)} r={f2(s * 0.012)} fill={lighten(pal.wallA, 0.5)} />
      {/* Mugs and notepads at each side place. */}
      {[cx - w * 0.33, cx + w * 0.33].map((x, i) => (
        <g key={i} stroke={edge(pal.wallB, 0.3)} strokeWidth={SET_LINE}>
          <rect x={f2(x - s * 0.06)} y={f2(surfY(0.6) - s * 0.008)} width={f2(s * 0.08)} height={f2(s * 0.016)} fill={lighten(pal.glow ?? pal.wallA, 0.3)} strokeWidth={2} />
          <rect x={f2(x + (i ? -s * 0.08 : s * 0.04))} y={f2(surfY(0.3) - s * 0.06)} width={f2(s * 0.045)} height={f2(s * 0.06)} rx={5} fill={i ? pal.accent : lighten(pal.wallA, 0.4)} />
        </g>
      ))}
    </g>
  );
};

/**
 * An office chair seen from the front, for whoever sits at the back of the meeting table facing
 * the camera. The backrest shows around their shoulders; the table hides the rest.
 */
export const CrewOfficeChairFront: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const seatTop = base - SEAT_HEIGHT["crew-office-chair-front"] * s;
  const fill = pal.detail;
  const metal = darken(pal.shade, 0.25);
  const bw = s * 0.34;
  const top = seatTop - s * 0.5;
  return (
    <g stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      <rect x={f2(cx - s * 0.015)} y={f2(seatTop)} width={f2(s * 0.03)} height={f2(base - seatTop)} fill={metal} />
      <rect x={f2(cx - bw / 2)} y={f2(top)} width={f2(bw)} height={f2(seatTop - top)} rx={f2(s * 0.06)} fill={fill} />
      <rect x={f2(cx - bw * 0.36)} y={f2(top + s * 0.05)} width={f2(bw * 0.72)} height={f2(s * 0.012)} rx={4} fill={lighten(fill, 0.2)} stroke="none" />
      {[-1, 1].map((k) => (
        <rect key={k} x={f2(cx + k * (bw / 2 + s * 0.01) - s * 0.02)} y={f2(seatTop - s * 0.14)} width={f2(s * 0.04)} height={f2(s * 0.14)} rx={6} fill={metal} />
      ))}
      <rect x={f2(cx - bw * 0.62)} y={f2(seatTop - s * 0.02)} width={f2(bw * 1.24)} height={f2(s * 0.06)} rx={f2(s * 0.03)} fill={lighten(fill, 0.08)} />
    </g>
  );
};

/** A whiteboard on wheels for a presenter (stands behind the cast). `text` writes on it. */
export const CrewWhiteboard: PartComponent = ({ part, palette: pal, W, H, groundY, fig, marks, fontFamily }) => {
  const s = fig * part.size;
  const cx = partX(part, W, marks, 0.5);
  const base = partBase(part, H, groundY);
  const bw = s * 0.62;
  const top = base - s * 1.05;
  const bh = s * 0.42;
  const frameC = lighten(pal.shade, 0.25);
  const lines = typeof part.text === "string" ? part.text.split("\n") : [];
  return (
    <g strokeLinejoin="round">
      {[-0.4, 0.4].map((k) => (
        <rect key={k} x={f2(cx + k * bw - s * 0.01)} y={f2(top + bh)} width={f2(s * 0.02)} height={f2(base - top - bh)} fill={frameC} stroke={edge(frameC)} strokeWidth={SET_LINE} />
      ))}
      <rect x={f2(cx - bw / 2)} y={f2(top)} width={f2(bw)} height={f2(bh)} rx={8} fill={lighten(pal.wallA, 0.8)} stroke={frameC} strokeWidth={f2(s * 0.014)} />
      {lines.length ? (
        lines.slice(0, 3).map((l, i) => (
          <text key={i} x={f2(cx)} y={f2(top + bh * (0.3 + 0.27 * i))} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={f2(bh * 0.17)} fill={i ? pal.detail : pal.accent}>
            {l}
          </text>
        ))
      ) : (
        <g fill="none" strokeWidth={5} strokeLinecap="round">
          <path d={`M ${f2(cx - bw * 0.38)} ${f2(top + bh * 0.3)} h ${f2(bw * 0.4)}`} stroke={pal.accent} />
          <path d={`M ${f2(cx - bw * 0.38)} ${f2(top + bh * 0.5)} h ${f2(bw * 0.28)}`} stroke={pal.detail} />
          <path d={`M ${f2(cx - bw * 0.38)} ${f2(top + bh * 0.7)} h ${f2(bw * 0.34)}`} stroke={pal.detail} />
          <path d={`M ${f2(cx + bw * 0.12)} ${f2(top + bh * 0.78)} l ${f2(bw * 0.08)} ${f2(-bh * 0.18)} l ${f2(bw * 0.07)} ${f2(bh * 0.08)} l ${f2(bw * 0.1)} ${f2(-bh * 0.35)}`} stroke={pal.accent} />
        </g>
      )}
      <rect x={f2(cx - bw * 0.3)} y={f2(top + bh)} width={f2(bw * 0.6)} height={f2(s * 0.02)} rx={4} fill={frameC} stroke={edge(frameC)} strokeWidth={SET_LINE} />
    </g>
  );
};

/** The near row of the meeting room (foreground): two office-chair backs at the frame edges, for depth in a wide shot. */
export const CrewOfficeNear: PartComponent = ({ palette: pal, W, H }) => {
  const fill = darken(pal.detail, 0.08);
  const top = H * 0.86;
  const backs = [
    { x0: -W * 0.06, x1: W * 0.3 },
    { x0: W * 0.7, x1: W * 1.06 },
  ];
  return (
    <g stroke={edge(fill)} strokeWidth={SET_LINE} strokeLinejoin="round">
      {backs.map((b, i) => (
        <g key={i}>
          <rect x={f2(b.x0)} y={f2(top)} width={f2(b.x1 - b.x0)} height={f2(H - top + 60)} rx={W * 0.07} fill={fill} />
          <rect x={f2(b.x0 + (b.x1 - b.x0) * 0.2)} y={f2(top + H * 0.025)} width={f2((b.x1 - b.x0) * 0.6)} height={f2(H * 0.012)} rx={6} fill={lighten(fill, 0.18)} stroke="none" />
        </g>
      ))}
      {/* A credenza between them with a phone and a takeaway cup. */}
      <rect x={f2(W * 0.3)} y={f2(H * 0.9)} width={f2(W * 0.4)} height={f2(H * 0.12)} rx={10} fill={mix(pal.wallA, pal.accent, 0.18)} />
      <rect x={f2(W * 0.4)} y={f2(H * 0.893)} width={f2(W * 0.07)} height={f2(H * 0.008)} rx={4} fill={darken(pal.shade, 0.35)} />
      <path d={`M ${f2(W * 0.58)} ${f2(H * 0.9)} l ${f2(-W * 0.006)} ${f2(-H * 0.04)} h ${f2(W * 0.045)} l ${f2(-W * 0.006)} ${f2(H * 0.04)} Z`} fill={lighten(pal.wallA, 0.4)} />
      <rect x={f2(W * 0.572)} y={f2(H * 0.857)} width={f2(W * 0.05)} height={f2(H * 0.008)} rx={3} fill={pal.accent} />
    </g>
  );
};
