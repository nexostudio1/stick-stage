/**
 * Loudness of a 16-bit PCM WAV, for the SFX mix (`src/engine/audio/mix.ts`): the loudest 400 ms
 * RMS window (100 ms hop) and the sample peak, both dBFS. Unweighted on purpose: the mix only
 * needs sounds level with each other, and the dialog calibration uses the same measure.
 */
import fs from "node:fs";

const round1 = (x: number) => Math.round(x * 10) / 10;
const toDb = (power: number) => round1(10 * Math.log10(Math.max(power, 1e-12)));

export const measureWav = (file: string): { loudnessDb: number; peakDb: number } => {
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
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let c = 0; c < channels; c++) v += data.readInt16LE((i * channels + c) * 2) / 32768;
    x[i] = v / channels;
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
  return { loudnessDb: toDb(best), peakDb: toDb(peak * peak) };
};
