/**
 * The `globe` figure's land: the `map` figure's Natural Earth outlines turned back into lon/lat
 * rings (inverse Natural Earth I), and an orthographic view that clips each ring at the horizon
 * and runs the hidden part along the limb. Pure maths, cached on first use.
 */
import world from "../../data/maps/world-110m.json";
import { f2 } from "../lib/math";

const RAD = Math.PI / 180;

type LonLat = [number, number];

/** Natural Earth I y(φ) and x-scale(φ), as in `geo.ts` (map units ÷ 1000). */
const yOf = (p: number) => {
  const p2 = p * p;
  const p4 = p2 * p2;
  return p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
};
const xScale = (p: number) => {
  const p2 = p * p;
  const p4 = p2 * p2;
  return 0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4));
};

/** Map units (x right, y down, ×1000) → lon/lat degrees (Newton on y). */
export const unproject = (mx: number, my: number): LonLat => {
  const Y = -my / 1000;
  let p = Y;
  for (let i = 0; i < 8; i++) {
    const h = 1e-6;
    const d = (yOf(p + h) - yOf(p - h)) / (2 * h);
    p -= (yOf(p) - Y) / d;
  }
  const lon = mx / 1000 / xScale(p) / RAD;
  return [Math.max(-180, Math.min(180, lon)), Math.max(-90, Math.min(90, p / RAD))];
};

let rings: LonLat[][] | undefined;

/** Every land ring in lon/lat (from the map's absolute M/L paths). */
export const landRings = (): LonLat[][] => {
  if (rings) return rings;
  const out: LonLat[][] = [];
  for (const r of world.regions) {
    for (const part of r.d.split("M").slice(1)) {
      const nums = part.replace(/[LZz]/g, " ").trim().split(/\s+/).map(Number);
      const ring: LonLat[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) ring.push(unproject(nums[i]!, nums[i + 1]!));
      if (ring.length > 2) out.push(ring);
    }
  }
  rings = out;
  return out;
};

export type View = { lon: number; lat: number; r: number; cx: number; cy: number };

/** Orthographic projection: screen point and whether it faces the viewer. */
export const ortho = (v: View, lon: number, lat: number) => {
  const l = (lon - v.lon) * RAD;
  const p = lat * RAD;
  const p0 = v.lat * RAD;
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  return { x: v.cx + v.r * x, y: v.cy - v.r * y, front: cosc > 0, cosc };
};

/** One ring as an SVG path on the globe: visible runs joined by arcs along the limb. */
export const ringPath = (v: View, ring: readonly LonLat[]): string => {
  const pts = ring.map(([lo, la]) => ({ ...ortho(v, lo, la), lo, la }));
  const start = pts.findIndex((q) => q.front);
  if (start < 0) return "";
  const n = pts.length;
  const limb = (a: { lo: number; la: number; cosc: number }, b: { lo: number; la: number; cosc: number }) => {
    // Where the segment crosses the horizon (cosc = 0), pushed onto the limb.
    const u = a.cosc / (a.cosc - b.cosc);
    const q = ortho(v, a.lo + (b.lo - a.lo) * u, a.la + (b.la - a.la) * u);
    const ang = Math.atan2(q.y - v.cy, q.x - v.cx);
    return { x: v.cx + v.r * Math.cos(ang), y: v.cy + v.r * Math.sin(ang), ang };
  };
  let d = `M ${f2(pts[start]!.x)} ${f2(pts[start]!.y)}`;
  let exit: { ang: number } | undefined;
  for (let k = 1; k <= n; k++) {
    const a = pts[(start + k - 1) % n]!;
    const b = pts[(start + k) % n]!;
    if (a.front && b.front) d += ` L ${f2(b.x)} ${f2(b.y)}`;
    else if (a.front && !b.front) {
      const e = limb(a, b);
      d += ` L ${f2(e.x)} ${f2(e.y)}`;
      exit = e;
    } else if (!a.front && b.front) {
      const e = limb(a, b);
      if (exit) {
        let delta = e.ang - exit.ang;
        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        d += ` A ${f2(v.r)} ${f2(v.r)} 0 0 ${delta > 0 ? 1 : 0} ${f2(e.x)} ${f2(e.y)}`;
      }
      d += ` L ${f2(b.x)} ${f2(b.y)}`;
      exit = undefined;
    }
  }
  return `${d} Z`;
};

/** A line of constant latitude or longitude, front side only, as an open path. */
export const gridPath = (v: View, pts: readonly LonLat[]): string => {
  let d = "";
  let pen = false;
  for (const [lo, la] of pts) {
    const q = ortho(v, lo, la);
    if (!q.front) {
      pen = false;
      continue;
    }
    d += `${pen ? " L" : " M"} ${f2(q.x)} ${f2(q.y)}`;
    pen = true;
  }
  return d.trim();
};
