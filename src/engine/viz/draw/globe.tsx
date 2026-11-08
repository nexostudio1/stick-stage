/** A spinning Earth: `globe` (and the small Earth inside `earthmoon`). */
import React from "react";
import { mix } from "../../lib/color";
import { f2 } from "../../lib/math";
import { gridPath, landRings, ortho, ringPath, type View } from "../globe";
import type { GlobeP } from "../paramsTime";
import type { VizTheme } from "../theme";
import { Arrow, phase, Txt, type DrawProps } from "./common";

const RAD = Math.PI / 180;
const OCEAN = "#2b6cb0";
const LAND = "#3f8f5a";
const ICE = "#f4f7fb";

const latLine = (lat: number) => Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat] as [number, number]);
const lonLine = (lon: number) => Array.from({ length: 37 }, (_, i) => [lon, -90 + i * 5] as [number, number]);
const GRID = [...[-60, -30, 0, 30, 60].map(latLine), ...Array.from({ length: 12 }, (_, i) => lonLine(-180 + i * 30))];

export type EarthProps = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  lon: number;
  lat: number;
  theme: VizTheme;
  unit: number;
  t: number;
  reveal: number;
  night?: number;
  light?: number;
  ice?: number;
  melt?: number;
  grid?: boolean;
};

/** The disc itself: ocean, land, ice, meltwater, the night side and the rim. */
export const Earth: React.FC<EarthProps> = ({ id, cx, cy, r, lon, lat, theme, unit, t, reveal, night = 0.6, light = 200, ice = 0, melt = 0, grid = true }) => {
  const v: View = { lon, lat, r, cx, cy };
  const sw = theme.stroke * unit;
  const clip = `globe-${id}`;
  const shade = `globe-night-${id}`;
  const ocean = mix(OCEAN, theme.paper, theme.dark ? 0.1 : 0.18);
  const land = mix(LAND, theme.paper, theme.dark ? 0.05 : 0.12);
  const landOn = phase(reveal, 0.2, 0.8);
  const capLat = 90 - 25 * ice;
  const dx = Math.cos(light * RAD);
  const dy = Math.sin(light * RAD);
  const dots = Array.from({ length: 28 }, (_, k) => {
    const u = (t * 0.22 + k * 0.618) % 1;
    const north = k % 2 === 0;
    const la = (north ? 1 : -1) * (72 - 62 * u);
    return { q: ortho(v, -180 + ((k * 47) % 360), la), o: Math.sin(Math.PI * u) };
  });
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <circle cx={f2(cx)} cy={f2(cy)} r={f2(r)} />
        </clipPath>
        <linearGradient id={shade} x1={f2(0.5 + 0.5 * dx)} y1={f2(0.5 + 0.5 * dy)} x2={f2(0.5 - 0.5 * dx)} y2={f2(0.5 - 0.5 * dy)}>
          <stop offset="0.42" stopColor="#05070f" stopOpacity={0} />
          <stop offset="0.62" stopColor="#05070f" stopOpacity={0.62 * night} />
          <stop offset="1" stopColor="#05070f" stopOpacity={0.72 * night} />
        </linearGradient>
      </defs>
      <circle cx={f2(cx)} cy={f2(cy)} r={f2(r)} fill={ocean} />
      <g clipPath={`url(#${clip})`}>
        <g opacity={landOn}>
          {landRings().map((ring, i) => {
            const d = ringPath(v, ring);
            return d ? <path key={i} d={d} fill={land} stroke={mix(land, "#000000", 0.25)} strokeWidth={f2(sw * 0.18)} strokeLinejoin="round" /> : null;
          })}
        </g>
        {ice > 0 ? (
          <g opacity={landOn}>
            <path d={ringPath(v, latLine(capLat))} fill={ICE} opacity={0.95} />
            <path d={ringPath(v, latLine(-capLat))} fill={ICE} opacity={0.95} />
          </g>
        ) : null}
        {melt > 0
          ? dots.map((d, k) =>
              d.q.front ? <circle key={k} cx={f2(d.q.x)} cy={f2(d.q.y)} r={f2(r * 0.03)} fill="#9fd8ff" stroke={ocean} strokeWidth={f2(sw * 0.15)} opacity={melt * d.o} /> : null,
            )
          : null}
        {grid ? (
          <g opacity={0.28 * landOn}>
            {GRID.map((pts, i) => (
              <path key={i} d={gridPath(v, pts)} fill="none" stroke={theme.paper} strokeWidth={f2(sw * 0.2)} />
            ))}
          </g>
        ) : null}
        {night > 0 ? <circle cx={f2(cx)} cy={f2(cy)} r={f2(r)} fill={`url(#${shade})`} /> : null}
      </g>
      <circle cx={f2(cx)} cy={f2(cy)} r={f2(r)} fill="none" stroke={theme.ink} strokeWidth={f2(sw * 0.7)} />
    </g>
  );
};

/** The figure: the Earth, its tidal bulge, a spin arrow and labelled places. */
export const Globe: React.FC<DrawProps<GlobeP> & { fs: number; id: string }> = ({ p, w, h, theme, reveal, t, unit, fontFamily, fs, id }) => {
  const r = Math.min(w, h) * 0.42;
  const cx = w / 2;
  const cy = h / 2;
  const lon = p.lon - p.spin * t;
  const sw = theme.stroke * unit;
  const v: View = { lon, lat: p.lat, r, cx, cy };
  const arrowOn = p.arrow * phase(reveal, 0.5, 1);
  // The near side moves left to right as the Earth turns east: an arc under the equator.
  const arc = Array.from({ length: 25 }, (_, i) => {
    const a = (200 + (i / 24) * 140) * RAD;
    return { x: cx + r * 1.12 * Math.cos(a), y: cy - r * 0.32 * Math.sin(a) + r * 0.62 };
  });
  const drawn = arc.slice(0, Math.max(2, Math.round(arc.length * arrowOn)));
  return (
    <g>
      {p.bulge > 0 ? (
        <ellipse cx={f2(cx)} cy={f2(cy)} rx={f2(r * (1 + 0.38 * p.bulge))} ry={f2(r * (1 + 0.03 * p.bulge))} transform={`rotate(${f2(p.bulgeAngle)} ${f2(cx)} ${f2(cy)})`} fill={mix(OCEAN, theme.paper, 0.45)} opacity={0.75 * phase(reveal, 0.3, 1)} stroke={mix(OCEAN, theme.paper, 0.2)} strokeWidth={f2(sw * 0.4)} />
      ) : null}
      <Earth id={id} cx={cx} cy={cy} r={r} lon={lon} lat={p.lat} theme={theme} unit={unit} t={t} reveal={reveal} night={p.night} light={p.light} ice={p.ice} melt={p.melt} grid={p.grid} />
      {arrowOn > 0.05 ? (
        <g opacity={arrowOn}>
          <path d={`M ${drawn.map((q) => `${f2(q.x)} ${f2(q.y)}`).join(" L ")}`} fill="none" stroke={theme.highlight} strokeWidth={f2(sw * 0.9)} strokeLinecap="round" />
          <Arrow x1={drawn[drawn.length - 2]!.x} y1={drawn[drawn.length - 2]!.y} x2={drawn[drawn.length - 1]!.x} y2={drawn[drawn.length - 1]!.y} color={theme.highlight} width={sw * 0.9} head={sw * 3.4} />
        </g>
      ) : null}
      {p.points.map((pt, i) => {
        const q = ortho(v, pt.lon, pt.lat);
        if (!q.front) return null;
        const on = phase(reveal, 0.6, 0.9) * Math.min(1, q.cosc * 4);
        return (
          <g key={i} opacity={on}>
            <circle cx={f2(q.x)} cy={f2(q.y)} r={f2(fs * 0.3)} fill={theme.highlight} stroke={theme.paper} strokeWidth={f2(sw * 0.5)} />
            {pt.label ? <Txt x={q.x + fs * 0.5} y={q.y} size={fs * 0.8} color={theme.ink} halo={theme.paper} anchor="start" weight={800} fontFamily={fontFamily}>{pt.label}</Txt> : null}
          </g>
        );
      })}
    </g>
  );
};
