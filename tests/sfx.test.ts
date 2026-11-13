import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SFX_CEILING, SFX_PEAK_DBFS, sfxVolume } from "../src/engine/audio/mix";
import { SfxManifestSchema } from "../src/engine/director/librarySchemas";
import { measureWav } from "../scripts/lib/loudness";

const ROOT = path.resolve(import.meta.dirname, "..");
const manifest = SfxManifestSchema.parse(JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/sfx.json"), "utf8")));

describe("the SFX library is measured, licensed and inside its ceiling", () => {
  it("every sound has a licence and a source", () => {
    for (const s of manifest.sounds) {
      expect(s.license, s.id).toBeTruthy();
      expect(s.source, s.id).toBeTruthy();
    }
  });

  for (const s of manifest.sounds) {
    it(`${s.id} is measured at the file it ships`, () => {
      const file = path.join(ROOT, "public", s.file);
      expect(fs.existsSync(file), `${s.file} missing`).toBe(true);
      const m = measureWav(file);
      // The manifest is the number the mix reads, so it has to be the file's own.
      expect(s.loudnessDb, `${s.id} loudnessDb`).toBeCloseTo(m.loudnessDb, 0);
      expect(s.truePeakDb, `${s.id} truePeakDb`).toBeCloseTo(m.truePeakDb, 0);
    });

    it(`${s.id} does not overshoot 0 dBTP`, () => {
      // This is the bug the true-peak term exists for: normalising on the sample peak left four
      // files over 0 dBTP (zap by 3.1 dB) while the manifest reported a sample peak of -1.0.
      expect(s.truePeakDb ?? 0).toBeLessThanOrEqual(0);
    });

    it(`${s.id} cannot be played above the transient ceiling`, () => {
      const played = (s.truePeakDb ?? s.peakDb ?? -1) + 20 * Math.log10(sfxVolume(s, 1));
      expect(played, `${s.id} at cue volume 1`).toBeLessThanOrEqual(SFX_PEAK_DBFS + 1e-6);
      expect(sfxVolume(s, 1)).toBeLessThanOrEqual(SFX_CEILING);
    });
  }

  it("carries the three comedy staples the library was missing", () => {
    for (const id of ["door-knock", "applause", "camera-shutter"]) {
      expect(manifest.sounds.some((s) => s.id === id), id).toBe(true);
    }
  });
});
