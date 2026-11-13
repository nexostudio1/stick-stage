/** Comedy staples the library was missing: a door knock, applause, a camera shutter. Synthesized like the rest. */
import { buf, env, filter, mix, noise, osc, perc, SR, type Sig } from "./synth";

type Sound = { id: string; gain: number; tags: string[]; make: () => Sig };

/** Mulberry32, same generator as `noise`, for placement jitter that is the same on every run. */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Knuckle on a hollow door: a low body with two resonant modes, a woody click, a soft thump. */
const knock = (seed: number, pitch: number, len = 0.3): Sig => {
  const body = mix(
    len,
    [env(osc(len, () => 132 * pitch), perc(0.0015, 26))],
    [env(osc(len, () => 214 * pitch), perc(0.0015, 40)), 0.5],
    [env(osc(len, () => 396 * pitch), perc(0.002, 65)), 0.18],
  );
  const click = env(filter(noise(0.06, seed), "bp", () => 2100 * pitch, 0.9), perc(0.0004, 120));
  const thump = env(filter(noise(0.09, seed + 7), "lp", () => 620), perc(0.0008, 38));
  return mix(len, [body], [click, 0.5], [thump, 0.65]);
};

/** One pair of hands: a short bright band with a little body under it. */
const clap = (seed: number, hz: number, len = 0.075): Sig =>
  mix(len, [env(filter(noise(len, seed), "bp", () => hz, 1.1), perc(0.0004, 48))], [env(filter(noise(len, seed + 3), "lp", () => 500), perc(0.0006, 35)), 0.35]);

/** A shutter blade: a hard band of noise plus a thin metal ring. */
const blade = (seed: number, hz: number, decay: number, len = 0.09): Sig =>
  mix(len, [env(filter(noise(len, seed), "bp", () => hz, 1.4), perc(0.0004, decay))], [env(osc(len, () => 3100, "tri"), perc(0.0008, 90)), 0.18]);

export const COMEDY_SOUNDS: Sound[] = [
  {
    // Knock knock knock: three knuckles, never the same twice in a row.
    id: "door-knock",
    gain: 0.75,
    tags: ["knock", "entrance", "comedy"],
    make: () => {
      const hits: [number, number, number, number][] = [
        [0, 1, 1, 21],
        [0.152, 0.9, 1.03, 22],
        [0.296, 0.97, 0.985, 23],
      ];
      return mix(0.62, ...hits.map(([at, amp, pitch, seed]): [Sig, number, number] => [knock(seed, pitch), amp, at]));
    },
  },
  {
    // A room of hands: individual claps placed by a shaped envelope, so the crowd is density, not a riser.
    id: "applause",
    gain: 0.6,
    tags: ["crowd", "approval", "comedy"],
    make: () => {
      const T = 1.7;
      const out = buf(T);
      const rand = rng(4242);
      const shape = (t: number) => Math.min(1, t / 0.09) * Math.exp(-Math.max(0, t - 0.72) * 3.4);
      let placed = 0;
      // Dense enough that neighbouring claps overlap: a frame with one hand too few must not read as a hole.
      for (let k = 0; k < 4000 && placed < 760; k++) {
        const at = rand() * T;
        const level = shape(at);
        if (rand() > level) continue;
        const hit = clap(200 + placed, 1200 + 2400 * rand());
        const off = Math.round(at * SR);
        const amp = (0.6 + 0.4 * rand()) * (0.5 + 0.5 * level);
        for (let i = 0; i < hit.length && off + i < out.length; i++) out[off + i]! += hit[i]! * amp;
        placed++;
      }
      // The room behind the hands: quiet band-limited noise, so the gaps between claps are a space.
      const room = env(filter(noise(T, 88), "bp", () => 1500, 0.6), (t) => 0.045 * shape(t));
      // Hands are mostly 0.7-3 kHz with a snap on top; without this the top of the noise reads as hiss.
      return filter(mix(T, [out], [room, 1]), "lp", () => 6500);
    },
  },
  {
    // Curtain release, mirror slap, re-cock: three events, the middle one sharpest.
    id: "camera-shutter",
    gain: 0.7,
    tags: ["camera", "snap", "comedy"],
    make: () => {
      const whump = env(filter(noise(0.12, 45), "lp", () => 300), perc(0.001, 34));
      return mix(
        0.34,
        [blade(40, 3400, 260), 0.5, 0],
        [mix(0.12, [blade(41, 2600, 150)], [whump, 0.45]), 1, 0.052],
        [blade(42, 2200, 200), 0.45, 0.16],
      );
    },
  },
];
