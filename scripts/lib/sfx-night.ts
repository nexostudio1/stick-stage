/** The Catch's night-shift cues (flap clack, coins, register, stamp…), synthesized like the rest of the library. */
import { buf, env, filter, mix, noise, osc, perc, saturate, SR, type Sig } from "./synth";

type Sound = { id: string; gain: number; tags: string[]; make: () => Sig };

/** One hard plastic tick: a short band of noise and a woody click. */
const tick = (seed: number, hz = 2400, len = 0.05): Sig =>
  mix(len, [env(filter(noise(len, seed), "bp", () => hz, 2.2), perc(0.0005, 140))], [env(osc(len, () => hz / 3, "tri"), perc(0.0005, 90)), 0.4]);

/** A coin: a few inharmonic bell partials. */
const coin = (hz: number, len = 0.5): Sig =>
  mix(len, [env(osc(len, () => hz), perc(0.001, 9))], [env(osc(len, () => hz * 2.41), perc(0.001, 14)), 0.5], [env(osc(len, () => hz * 3.93), perc(0.001, 20)), 0.3]);

export const NIGHT_SOUNDS: Sound[] = [
  {
    // A split-flap board settling: a quick run of ticks, slowing down, then a firm clack.
    id: "clack",
    gain: 0.7,
    tags: ["flap", "counter", "the-catch"],
    make: () => {
      const times = [0, 0.035, 0.068, 0.1, 0.13, 0.165, 0.205, 0.255];
      return mix(0.42, ...times.map((at, i): [Sig, number, number] => [tick(30 + i, 2000 + (i % 3) * 400), i === times.length - 1 ? 1.2 : 0.55, at]));
    },
  },
  {
    id: "coins",
    gain: 0.6,
    tags: ["money", "clink", "the-catch"],
    make: () => mix(0.8, [coin(3150), 0.7, 0], [coin(2780), 0.6, 0.09], [coin(3420), 0.5, 0.21]),
  },
  {
    // Coins pouring onto a pile: many clinks with a rumble under them.
    id: "coin-avalanche",
    gain: 0.6,
    tags: ["money", "pile", "the-catch"],
    make: () => {
      const T = 1.8;
      const parts: [Sig, number, number][] = Array.from({ length: 40 }, (_, i) => [coin(2400 + ((i * 397) % 1600), 0.3), 0.25 + ((i * 7) % 5) / 10, (i / 40) ** 1.4 * 1.4]);
      const rumble = env(filter(noise(T, 41), "lp", () => 300, 0.7), (t) => Math.sin((Math.PI * t) / T));
      return mix(T, ...parts, [rumble, 0.5]);
    },
  },
  {
    // The till: a bell ding and the cash drawer sliding out.
    id: "register",
    gain: 0.7,
    tags: ["money", "sale", "the-catch"],
    make: () => {
      const bell = mix(1, [env(osc(1, () => 1760), perc(0.001, 4))], [env(osc(1, () => 2640), perc(0.001, 6)), 0.4]);
      const drawer = env(filter(noise(0.35, 42), "bp", (t) => 600 + 900 * t, 1.1), (t) => Math.min(1, t / 0.02) * Math.exp(-t * 5));
      return mix(1.1, [drawer, 0.7, 0], [tick(43, 1400, 0.06), 0.8, 0.3], [bell, 0.8, 0.32]);
    },
  },
  {
    id: "stamp",
    gain: 0.9,
    tags: ["verdict", "slam", "the-catch"],
    make: () => {
      const T = 0.5;
      const body = env(osc(T, (t) => 95 * Math.exp(-t * 6) + 45), perc(0.001, 11));
      const slap = env(filter(noise(0.08, 44), "lp", () => 2200, 0.8), perc(0.0005, 60));
      return saturate(mix(T, [body, 1], [slap, 0.8]), 1.8);
    },
  },
  {
    id: "drawer",
    gain: 0.6,
    tags: ["slide", "wood", "the-catch"],
    make: () => {
      const T = 0.6;
      const rub = env(filter(noise(T, 45), "bp", () => 420, 1.6), (t) => Math.sin((Math.PI * Math.min(t, 0.45)) / 0.45) * (t < 0.45 ? 1 : 0));
      return mix(T, [rub, 0.8], [tick(46, 900, 0.08), 1, 0.46]);
    },
  },
  {
    id: "rustle",
    gain: 0.5,
    tags: ["paper", "note", "the-catch"],
    make: () => {
      const T = 0.45;
      return env(filter(noise(T, 47), "hp", () => 2800, 0.8), (t) => (0.5 + 0.5 * Math.sin(t * 70) ** 2) * Math.sin((Math.PI * t) / T));
    },
  },
  {
    id: "clock-tick",
    gain: 0.5,
    tags: ["time", "the-catch"],
    make: () => mix(2.05, ...[0, 0.5, 1, 1.5].map((at, i): [Sig, number, number] => [tick(48 + i, i % 2 ? 2600 : 3200, 0.04), 0.9, at])),
  },
  {
    // A neon tube striking: two stutters, then a steady 120 Hz buzz that fades.
    id: "neon-on",
    gain: 0.45,
    tags: ["light", "neon", "the-catch"],
    make: () => {
      const T = 1.2;
      const buzz = mix(T, [osc(T, () => 120, "saw"), 0.4], [osc(T, () => 240), 0.3]);
      const gate = (t: number) => (t < 0.06 || (t > 0.14 && t < 0.18) || t > 0.28 ? 1 : 0) * Math.exp(-Math.max(0, t - 0.4) * 2.5);
      return env(filter(buzz, "lp", () => 1800, 0.7), gate);
    },
  },
  {
    id: "pin",
    gain: 0.6,
    tags: ["board", "tap", "the-catch"],
    make: () => mix(0.2, [tick(49, 1800, 0.05), 1, 0], [env(osc(0.15, () => 620), perc(0.001, 30)), 0.4, 0]),
  },
  {
    id: "click",
    gain: 0.6,
    tags: ["switch", "lamp", "the-catch"],
    make: () => mix(0.12, [tick(50, 3600, 0.03), 1, 0], [tick(51, 2200, 0.03), 0.6, 0.04]),
  },
  {
    // A low swell into the catch: a sub drop under a reversed cymbal.
    id: "riser-hit",
    gain: 0.8,
    tags: ["reveal", "drop", "the-catch"],
    make: () => {
      const T = 2.2;
      const swell = env(filter(noise(1.4, 52), "hp", (t) => 2000 + 5000 * t, 0.8), (t) => (t / 1.4) ** 2.5);
      const sub = env(osc(0.8, (t) => 60 * Math.exp(-t * 1.5) + 32), perc(0.002, 3.5));
      const out = buf(T);
      const s = mix(T, [swell, 0.6, 0], [sub, 1, 1.4]);
      for (let i = 0; i < out.length; i++) out[i] = s[i]!;
      return saturate(out, 1.4).subarray(0, Math.round(T * SR));
    },
  },
];
