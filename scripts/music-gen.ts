/**
 * Original music beds: pnpm music
 *
 * Synthesized in code (deterministic, CC0), ducked under dialog: `room` (a quiet pentatonic loop)
 * and The Catch's four act beds (`lib/music-night.ts`).
 */
import fs from "node:fs";
import path from "node:path";
import { MusicManifestSchema, type MusicManifest } from "../src/engine";
import { env, mix, osc, writeWav, type Sig } from "./lib/synth";
import { NIGHT_BEDS } from "./lib/music-night";
import { MEDIEVAL_BEDS } from "./lib/music-medieval";
import { ROOT } from "./lib/tools";

const SOURCE = "synthesized in code by scripts/music-gen.ts (StickStage, original)";
const LICENSE = "CC0-1.0";

const room = (): Sig => {
  const notes = [261.63, 293.66, 329.63, 392, 329.63, 293.66];
  const len = 1.4;
  const T = notes.length * len;
  const parts = notes.map((hz, i): [Sig, number, number] => {
    const tone = env(osc(len, () => hz, "sine"), (t) => Math.sin((Math.PI * t) / len) ** 1.4);
    const fifth = env(osc(len, () => hz * 1.5, "sine"), (t) => 0.25 * Math.sin((Math.PI * t) / len));
    return [mix(len, [tone, 0.7], [fifth, 0.3]), 1, i * len];
  });
  return mix(T, ...parts);
};

const BEDS: { id: string; make: () => Sig; gain: number; ducked: number }[] = [
  { id: "room", make: room, gain: 0.18, ducked: 0.05 },
  { id: "mystery", make: NIGHT_BEDS.mystery, gain: 0.22, ducked: 0.08 },
  { id: "build", make: NIGHT_BEDS.build, gain: 0.24, ducked: 0.09 },
  { id: "drop", make: NIGHT_BEDS.drop, gain: 0.3, ducked: 0.1 },
  { id: "resolve", make: NIGHT_BEDS.resolve, gain: 0.22, ducked: 0.08 },
  { id: "medieval", make: MEDIEVAL_BEDS.medieval, gain: 0.22, ducked: 0.07 },
  { id: "medieval-tense", make: MEDIEVAL_BEDS.medievalTense, gain: 0.24, ducked: 0.08 },
];

const outDir = path.join(ROOT, "public/music");
const manifestPath = path.join(ROOT, "src/data/music.json");
fs.mkdirSync(outDir, { recursive: true });
/** Beds this script didn't make (licensed tracks added by hand, e.g. from Pixabay) are kept. */
const old: MusicManifest = fs.existsSync(manifestPath) ? MusicManifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, "utf8"))) : { schemaVersion: 1, beds: [] };
const made = BEDS.map((b) => {
    const file = `music/${b.id}.wav`;
    const durationMs = writeWav(path.join(ROOT, "public", file), b.make());
    console.log(`music: ${b.id} ${durationMs} ms → public/${file}`);
    return { id: b.id, file, durationMs, gain: b.gain, ducked: b.ducked, license: LICENSE, source: SOURCE };
});
const kept = old.beds.filter((b) => b.source !== SOURCE && !made.some((m) => m.id === b.id));
const manifest: MusicManifest = { schemaVersion: 1, beds: [...made, ...kept] };
fs.writeFileSync(manifestPath, JSON.stringify(MusicManifestSchema.parse(manifest), null, 2) + "\n");
