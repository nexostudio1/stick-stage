/**
 * Loudness of a 16-bit PCM WAV, for the SFX mix (`src/engine/audio/mix.ts`): the loudest 400 ms
 * RMS window (100 ms hop), the sample peak, and the true peak, all dBFS. Unweighted on purpose: the
 * mix only needs sounds level with each other, and the dialog calibration uses the same measure.
 *
 * The true peak matters because a sample peak does not bound what the DAC (or a codec, or a
 * resampler) reconstructs between samples: four files in the library peaked at -1.0 dBFS and still
 * overshot 0 dBTP, `zap.wav` by 3.1 dB. `writeWav` normalises on this measure now, and the mix's
 * transient cap reads it, so the number in the manifest is the one that reaches a listener's ears.
 */
import fs from "node:fs";

const round1 = (x: number) => Math.round(x * 10) / 10;
const toDb = (power: number) => round1(10 * Math.log10(Math.max(power, 1e-12)));

/** Oversampling factor for the true-peak estimate (ITU-R BS.1770 asks for at least 4x; 8x is cheap here). */
export const TRUE_PEAK_OVERSAMPLE = 8;
const HALF = 8;

/** Blackman-windowed sinc kernels, one per fractional phase; each phase sums to 1 so DC is unity. */
const KERNELS: Float32Array[] = Array.from({ length: TRUE_PEAK_OVERSAMPLE }, (_, p) => {
  const f = p / TRUE_PEAK_OVERSAMPLE;
  const k = new Float32Array(HALF * 2);
  let sum = 0;
  for (let j = 0; j < k.length; j++) {
    const x = j - HALF + 1 - f;
    const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
    const w = 0.42 + 0.5 * Math.cos((Math.PI * x) / HALF) + 0.08 * Math.cos((2 * Math.PI * x) / HALF);
    k[j] = sinc * (Math.abs(x) < HALF ? w : 0);
    sum += k[j]!;
  }
  for (let j = 0; j < k.length; j++) k[j] = k[j]! / sum;
  return k;
});

/** Largest absolute value the signal reconstructs to between samples (linear scale, 1 = 0 dBFS). */
export const truePeak = (x: Float32Array): number => {
  let max = 0;
  for (const v of x) max = Math.max(max, Math.abs(v));
  // Interpolation only has to run where the signal is close to its own maximum: a peak between
  // samples cannot be created where there is no energy to create it from (-20 dB gate).
  const gate = max * 0.1;
  let peak = max;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    if (Math.abs(x[i]!) <= gate && (i + 1 >= n || Math.abs(x[i + 1]!) <= gate)) continue;
    for (let p = 1; p < TRUE_PEAK_OVERSAMPLE; p++) {
      const k = KERNELS[p]!;
      let v = 0;
      for (let j = 0; j < k.length; j++) {
        const s = i + j - HALF + 1;
        if (s >= 0 && s < n) v += k[j]! * x[s]!;
      }
      const a = Math.abs(v);
      if (a > peak) peak = a;
    }
  }
  return peak;
};

export const measureWav = (file: string): { loudnessDb: number; peakDb: number; truePeakDb: number } => {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") throw new Error(`${file}: not a WAV`);
  let off = 12;
  let channels = 1;
  let rate = 44100;
  let bits = 16;
  let data: Buffer | undefined;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      channels = buf.readUInt16LE(off + 10);
      rate = buf.readUInt32LE(off + 12);
      bits = buf.readUInt16LE(off + 22);
    } else if (id === "data") data = buf.subarray(off + 8, off + 8 + size);
    off += 8 + size + (size % 2);
  }
  if (!data || bits !== 16) throw new Error(`${file}: expected 16-bit PCM`);
  const n = Math.floor(data.length / 2 / channels);
  const x = new Float64Array(n);
  const mono = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let c = 0; c < channels; c++) v += data.readInt16LE((i * channels + c) * 2) / 32768;
    x[i] = v / channels;
    mono[i] = x[i]!;
    peak = Math.max(peak, Math.abs(x[i]!));
  }
  const win = Math.round(0.4 * rate);
  const hop = Math.round(0.1 * rate);
  let best = 0;
  for (let start = 0; start === 0 || start + win <= n; start += hop) {
    let sum = 0;
    for (let i = start; i < Math.min(n, start + win); i++) sum += x[i]! * x[i]!;
    best = Math.max(best, sum / win);
    if (start + win >= n) break;
  }
  return { loudnessDb: toDb(best), peakDb: toDb(peak * peak), truePeakDb: toDb(truePeak(mono) ** 2) };
};
