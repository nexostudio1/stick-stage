/**
 * `pnpm voice:measure`: record each line's `loudnessDb` and `peakDb` in every skit's `voice.json`,
 * on the same measure the SFX mix uses (`scripts/lib/loudness.ts`). Run it after a TTS pass.
 *
 * Why the number belongs to the line: the renderer plays a voice file at unity, and rendered
 * voices do not arrive level. Measured 2026-11-11 over the 33 skits (333 WAV lines): the crew
 * cast's three Kokoro voices sit 4.1 dB apart (mitch under maya), within one skit the lines span
 * up to 12.1 dB, and across the library the medians range from -19.9 to -13.8 dB. The SFX are
 * levelled against a single dialog constant (`SFX_REF_DB`), so a line's distance from it changes
 * how loud the effects read next to that line by the same spread. This step only records the
 * measurements, the way `sfx.json` carries its own; nothing in the mix reads them yet. The pass
 * that does read them levels per speaker against a cast-level reference and leaves the expressive
 * spread inside one speaker's lines alone (maintainer decision, #11), so the numbers here stay raw.
 *
 * Non-WAV lines (the voice contract also allows MP3/OGG) are left alone: `measureWav` reads PCM
 * and there is no decoder in this repo's Node path, so `pnpm voice:measure` skips them by name.
 */
import fs from "node:fs";
import path from "node:path";
import { VoiceManifestSchema } from "../src/engine/voice/schema";
import { measureWav } from "./lib/loudness";
import { ROOT } from "./lib/tools";

const skitsDir = path.join(ROOT, "public/skits");
const skitIds = fs
  .readdirSync(skitsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(skitsDir, d.name, "voice.json")))
  .map((d) => d.name);

let measured = 0;
let skipped = 0;
for (const skit of skitIds) {
  const manifestPath = path.join(skitsDir, skit, "voice.json");
  const text = fs.readFileSync(manifestPath, "utf8");
  const raw = JSON.parse(text);
  const manifest = VoiceManifestSchema.parse(raw);
  // Keep the file's own indentation (they are not all the same): rewriting at one style would
  // turn a two-field addition into a whole-file diff.
  const indent = /\n(\s+)"/.exec(text)?.[1] ?? "  ";
  let touched = false;
  for (const [i, line] of manifest.lines.entries()) {
    if (!line.audio.toLowerCase().endsWith(".wav")) {
      skipped += 1;
      console.log(`${skit.padEnd(28)} ${line.id.padEnd(5)} skipped (not PCM WAV: ${line.audio})`);
      continue;
    }
    // Take the two numbers this pass records, not whatever `measureWav` returns: the measure
    // grew a `truePeakDb` for the SFX path, and spreading it here would rewrite every line with a
    // field nothing reads yet (the voice true peak belongs with the levelling pass that caps on it).
    const { loudnessDb, peakDb } = measureWav(path.join(skitsDir, skit, line.audio));
    raw.lines[i] = { ...raw.lines[i], loudnessDb, peakDb };
    touched = true;
    measured += 1;
    console.log(`${skit.padEnd(28)} ${line.id.padEnd(5)} ${String(loudnessDb).padStart(6)} dB  peak ${peakDb}`);
  }
  if (touched) fs.writeFileSync(manifestPath, JSON.stringify(raw, null, indent) + "\n");
}
console.log(`\n${measured} line(s) measured, ${skipped} skipped, ${skitIds.length} skit(s)`);