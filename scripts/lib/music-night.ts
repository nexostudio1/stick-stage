/**
 * The Catch's four act beds (CC0, synthesized): `mystery` (clues), `build` (the last clue),
 * `drop` (the catch), `resolve` (the verdict). 96 bpm, four bars each, so they loop seamlessly.
 */
import { env, filter, mix, noise, osc, perc, saturate, type Sig } from "./synth";

const BEAT = 60 / 96;
const BAR = BEAT * 4;
const T = BAR * 4;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
type Part = [Sig, number, number];

/** A soft pad chord: detuned sines with a slow swell over one bar. */
const pad = (notes: number[], len: number): Sig =>
  env(mix(len, ...notes.flatMap((n): Part[] => [[osc(len, () => hz(n) * 1.003), 0.5, 0], [osc(len, () => hz(n) * 0.997, "tri"), 0.3, 0]])), (t) => Math.min(1, t / 0.5) * Math.min(1, (len - t) / 0.4));
const pluck = (n: number, len = 0.6): Sig => mix(len, [env(osc(len, () => hz(n)), perc(0.003, 6))], [env(osc(len, () => hz(n) * 2), perc(0.003, 10)), 0.35]);
const bass = (n: number, len: number): Sig => filter(env(osc(len, () => hz(n), "saw"), perc(0.005, 7)), "lp", () => 380, 1);
const kick = (): Sig => env(osc(0.4, (t) => 50 + 110 * Math.exp(-t * 28)), perc(0.001, 9));
const hat = (seed: number): Sig => env(filter(noise(0.06, seed), "hp", () => 7000, 0.7), perc(0.0005, 70));

/** i–VI–iv–V in A minor (Am, F, Dm, E), the case-file loop; voicings in MIDI. */
const MINOR = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];
const ROOTS = [33, 29, 26, 28];
/** I–V–vi–IV in C (C, G, Am, F) for the resolve. */
const MAJOR = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
const MAJOR_ROOTS = [36, 31, 33, 29];

const chords = (set: number[][], gain: number): Part[] => set.map((c, i) => [pad(c, BAR), gain, i * BAR]);

export const mystery = (): Sig => {
  const parts: Part[] = [...chords(MINOR, 0.35)];
  ROOTS.forEach((r, b) => {
    for (let e = 0; e < 8; e++) parts.push([bass(r, BEAT / 2), e % 2 ? 0.35 : 0.55, b * BAR + (e * BEAT) / 2]);
  });
  for (let q = 0; q < 16; q++) parts.push([hat(60 + q), 0.12, q * BEAT + BEAT / 2]);
  const melody = [76, 72, 74, 71];
  melody.forEach((n, i) => parts.push([pluck(n, 1.2), 0.18, i * BAR + BEAT * 2.5]));
  return mix(T, ...parts);
};

export const build = (): Sig => {
  const parts: Part[] = [...chords(MINOR, 0.3)];
  ROOTS.forEach((r, b) => {
    for (let s = 0; s < 16; s++) parts.push([bass(r, BEAT / 4), 0.3 + 0.25 * (b / 3), b * BAR + (s * BEAT) / 4]);
  });
  for (let q = 0; q < 16; q++) parts.push([kick(), 0.6, q * BEAT], [hat(80 + q), 0.16, q * BEAT + BEAT / 2]);
  const up = filter(noise(T, 90), "bp", (t) => 400 + 3000 * (t / T), 3);
  parts.push([env(up, (t) => 0.15 * (t / T) ** 2), 1, 0]);
  return mix(T, ...parts);
};

export const drop = (): Sig => {
  const parts: Part[] = [[pad([45, 52, 57, 60], BAR * 2), 0.45, 0], [pad([41, 48, 53, 57], BAR * 2), 0.45, BAR * 2]];
  for (let h = 0; h < 8; h++) parts.push([kick(), 0.8, h * BEAT * 2], [hat(100 + h), 0.1, h * BEAT * 2 + BEAT]);
  parts.push([env(osc(T, (t) => (t < BAR * 2 ? hz(33) : hz(29))), (t) => 0.5 + 0.1 * Math.sin(t * 3)), 0.35, 0]);
  return saturate(mix(T, ...parts), 1.2);
};

export const resolve = (): Sig => {
  const parts: Part[] = [...chords(MAJOR, 0.3)];
  MAJOR_ROOTS.forEach((r, b) => parts.push([bass(r + 12, BAR), 0.3, b * BAR]));
  const line = [72, 76, 79, 76, 71, 74, 79, 74, 72, 76, 81, 76, 72, 77, 81, 77];
  line.forEach((n, i) => parts.push([pluck(n, 0.9), 0.2, i * BEAT]));
  return mix(T, ...parts);
};

export const NIGHT_BEDS = { mystery, build, drop, resolve } as const;
