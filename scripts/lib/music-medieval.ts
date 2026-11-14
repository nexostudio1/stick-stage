/**
 * The medieval channel's beds (CC0, synthesized): `medieval` (a fen-and-castle story bed: drone,
 * plucked lute line in D dorian, frame drum) and `medieval-tense` (same drone, low drum, no tune).
 * 80 bpm, four bars each, so they loop seamlessly.
 */
import { env, filter, mix, noise, osc, perc, saturate, type Sig } from "./synth";

const BEAT = 60 / 80;
const BAR = BEAT * 4;
const T = BAR * 4;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
type Part = [Sig, number, number];

/** A reedy drone (a hurdy-gurdy / bagpipe hint): filtered saws on a fifth with a slow swell. */
const drone = (root: number): Sig =>
  env(
    filter(mix(T, [osc(T, () => hz(root), "saw"), 0.5, 0], [osc(T, () => hz(root + 7) * 1.002, "saw"), 0.35, 0], [osc(T, () => hz(root + 12) * 0.998, "saw"), 0.2, 0]), "lp", (t) => 700 + 250 * Math.sin(t * 0.8), 0.9),
    (t) => Math.min(1, t / 0.6) * Math.min(1, (T - t) / 0.3) * (0.85 + 0.15 * Math.sin(t * 1.3)),
  );
/** A lute-ish pluck: bright attack, quick decay, a little body. */
const lute = (n: number, len = 0.9): Sig => filter(mix(len, [env(osc(len, () => hz(n), "tri"), perc(0.002, 5))], [env(osc(len, () => hz(n) * 2), perc(0.002, 9)), 0.4], [env(osc(len, () => hz(n) * 3), perc(0.001, 14)), 0.15]), "lp", () => 3200);
/** A frame drum: low skin, a slap on the off-beats. */
const drum = (low: boolean, seed: number): Sig =>
  low ? env(osc(0.5, (t) => 75 + 50 * Math.exp(-t * 18)), perc(0.002, 7)) : mix(0.15, [env(filter(noise(0.15, seed), "bp", () => 1100, 1.2), perc(0.0008, 35))], [env(osc(0.15, () => 190), perc(0.001, 30)), 0.4]);

/** D dorian, four bars: a simple modal tune over the drone. */
const TUNE = [62, 65, 67, 69, 67, 65, 64, 62, 69, 71, 72, 71, 69, 67, 65, 64, 62, 65, 67, 69, 72, 71, 69, 67, 65, 64, 62, 64, 65, 64, 62, 62];

export const medieval = (): Sig => {
  const parts: Part[] = [[drone(38), 0.32, 0]];
  TUNE.forEach((n, i) => parts.push([lute(n), i % 4 === 0 ? 0.3 : 0.22, (i * BEAT) / 2]));
  for (let b = 0; b < 16; b++) parts.push([drum(true, b), 0.5, b * BEAT], [drum(false, 200 + b), 0.18, b * BEAT + BEAT / 2]);
  return saturate(mix(T, ...parts), 1.1);
};

export const medievalTense = (): Sig => {
  const parts: Part[] = [[drone(38), 0.4, 0], [drone(39), 0.12, 0]];
  for (let b = 0; b < 16; b++) parts.push([drum(true, b), b % 4 === 0 ? 0.75 : 0.35, b * BEAT]);
  [0, 2].forEach((bar) => parts.push([lute(57, 2), 0.2, bar * BAR], [lute(58, 2), 0.18, bar * BAR + BAR]));
  return saturate(mix(T, ...parts), 1.2);
};

export const MEDIEVAL_BEDS = { medieval, medievalTense } as const;
