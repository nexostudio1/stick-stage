import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { VoiceManifestSchema } from "../src/engine/voice/schema";
import { measureWav } from "../scripts/lib/loudness";

const SKITS = path.resolve(import.meta.dirname, "..", "public/skits");
const withVoice = fs
  .readdirSync(SKITS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(SKITS, d.name, "voice.json")))
  .map((d) => d.name);

describe("every measured voice line matches the file it ships", () => {
  for (const skit of withVoice) {
    const manifest = VoiceManifestSchema.parse(JSON.parse(fs.readFileSync(path.join(SKITS, skit, "voice.json"), "utf8")));
    for (const line of manifest.lines) {
      if (!line.audio.toLowerCase().endsWith(".wav")) continue; // `pnpm voice:measure` skips decoders it lacks
      // Voicing does not write the numbers, so a line voiced on this machine but not yet measured
      // (`pnpm voice:measure`) carries none. Its file is still worth nothing to this test: the
      // number is only checked where one was recorded, and a failed/absent measurement is not a
      // failed line. Both fields come from the same pass, so either missing means unmeasured.
      if (line.loudnessDb === undefined || line.peakDb === undefined) continue;
      it(`${skit}/${line.id} is measured at the file it ships`, () => {
        const m = measureWav(path.join(SKITS, skit, line.audio));
        // The number is only worth carrying if it is the file's own (`pnpm voice:measure`).
        expect(line.loudnessDb, `${line.id} loudnessDb`).toBeCloseTo(m.loudnessDb, 0);
        expect(line.peakDb, `${line.id} peakDb`).toBeCloseTo(m.peakDb, 0);
      });
    }
  }
});
