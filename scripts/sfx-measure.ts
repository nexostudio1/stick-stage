/**
 * `pnpm sfx:measure`: record each sound's `loudnessDb` and `peakDb` in `src/data/sfx.json`, which
 * the mix levels every effect from (`src/engine/audio/mix.ts`). Run it after adding or replacing a
 * file in `public/sfx/`; `pnpm sfx` measures what it synthesizes itself.
 */
import fs from "node:fs";
import path from "node:path";
import { SfxManifestSchema } from "../src/engine/director/librarySchemas";
import { measureWav } from "./lib/loudness";
import { ROOT } from "./lib/tools";

const manifestPath = path.join(ROOT, "src/data/sfx.json");
const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const manifest = SfxManifestSchema.parse(raw);
const sounds = raw.sounds.map((s: Record<string, unknown>, i: number) => {
  const m = measureWav(path.join(ROOT, "public", manifest.sounds[i]!.file));
  return { ...s, ...m };
});
fs.writeFileSync(manifestPath, JSON.stringify({ ...raw, sounds }, null, 2) + "\n");
for (const s of sounds) console.log(`${String(s.id).padEnd(16)} ${String(s.loudnessDb).padStart(6)} dB  peak ${s.peakDb}`);
