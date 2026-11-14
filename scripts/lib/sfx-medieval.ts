/** The medieval channel's cues (water, wood, hooves, steel, war drum), synthesized like the rest of the library. */
import { env, filter, mix, noise, osc, perc, saturate, type Sig } from "./synth";

type Sound = { id: string; gain: number; tags: string[]; make: () => Sig };

/** A hoof on wet ground: a low thud with a short muddy click. */
const hoof = (seed: number): Sig => mix(0.12, [env(osc(0.12, (t) => 90 + 80 * Math.exp(-t * 60)), perc(0.001, 45))], [env(filter(noise(0.05, seed), "bp", () => 900, 1.5), perc(0.0005, 90)), 0.5]);

export const MEDIEVAL_SOUNDS: Sound[] = [
  {
    // A heavy body hitting water: a low thump, then a spray of filtered noise falling off.
    id: "splash",
    gain: 0.75,
    tags: ["water", "fall", "medieval"],
    make: () => {
      const T = 1.1;
      const body = env(osc(T, (t) => 70 + 60 * Math.exp(-t * 20)), perc(0.002, 9));
      const spray = env(filter(noise(T, 41), "bp", (t) => 2600 - 1800 * Math.min(1, t / T), 0.9), (t) => (t < 0.03 ? t / 0.03 : Math.exp(-(t - 0.03) * 4.2)));
      return mix(T, [body, 0.8], [spray, 0.9]);
    },
  },
  {
    // Rising tide: two seconds of low rolling water that swells.
    id: "water-rush",
    gain: 0.55,
    tags: ["water", "tide", "ambience", "medieval"],
    make: () => {
      const T = 2.4;
      const roll = filter(noise(T, 43), "lp", (t) => 500 + 300 * Math.sin(t * 5) ** 2, 0.8);
      const fizz = filter(noise(T, 44), "bp", () => 3000, 0.6);
      return env(mix(T, [roll, 1], [fizz, 0.15]), (t) => Math.min(1, t / 0.8) * Math.min(1, (T - t) / 0.5));
    },
  },
  {
    // Old wood under strain: a slow pitched groan with a rough edge.
    id: "creak",
    gain: 0.6,
    tags: ["wood", "cart", "door", "strain", "medieval"],
    make: () => {
      const T = 0.9;
      const f = (t: number) => 140 + 90 * Math.sin(t * 3.4) + 18 * Math.sin(t * 47);
      return env(filter(saturate(osc(T, f, "saw"), 2.5), "bp", () => 900, 2.2), (t) => Math.sin((Math.PI * t) / T) ** 0.8);
    },
  },
  {
    // Hooves at a walk on a soft track: a four-beat clip-clop.
    id: "hooves",
    gain: 0.65,
    tags: ["horse", "walk", "travel", "medieval"],
    make: () => mix(1.6, ...[0, 0.18, 0.4, 0.58, 0.8, 0.98, 1.2, 1.38].map((at, i): [Sig, number, number] => [hoof(50 + i), i % 2 ? 0.7 : 1, at])),
  },
  {
    // Steel on steel: bright inharmonic ring.
    id: "sword-clang",
    gain: 0.6,
    tags: ["sword", "steel", "fight", "medieval"],
    make: () => {
      const T = 1.2;
      const ring = (hz: number, d: number) => env(osc(T, () => hz), perc(0.0005, d));
      return mix(T, [ring(1830, 5), 0.5], [ring(2710, 7), 0.4], [ring(4190, 10), 0.3], [env(filter(noise(0.06, 61), "hp", () => 3000), perc(0.0003, 80)), 0.6]);
    },
  },
  {
    // A war drum: a deep skin hit for reveals and cuts to black.
    id: "war-drum",
    gain: 0.8,
    tags: ["drum", "impact", "reveal", "medieval"],
    make: () => mix(1.2, [env(osc(1.2, (t) => 55 + 40 * Math.exp(-t * 14)), perc(0.002, 4.5)), 1], [env(filter(noise(0.15, 62), "lp", () => 700), perc(0.001, 30)), 0.5]),
  },
];
