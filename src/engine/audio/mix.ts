/**
 * The SFX mix.
 *
 * The synthesized sounds are peak-normalised (every file peaks near -1 dBFS), so their loudness
 * differs by more than 20 dB: a sustained tone (`slide-up`, `buzzer`, `boom`) played as loud as the
 * dialog while a click barely registered. A flat trim cannot fix that (the 2026-11-04 SFX_MASTER
 * trim left `boom` level with the dialog), so each sound records its own loudness in `sfx.json`
 * (`loudnessDb`: the loudest 400 ms RMS window, dBFS; `peakDb`: sample peak; `pnpm sfx:measure`)
 * and `sfxVolume` levels it to SFX_REF_DB before the sound's `gain` applies.
 *
 * Calibration (2026-11-08): dialog (MAI TTS lines) peaks at about -15.7 dB on the same measure,
 * so SFX_REF_DB = -24 puts a gain-0.7 effect about 11 dB under the dialog, and SFX_DUCK takes it
 * another 6 dB down while a line is spoken. SFX_PEAK_DBFS caps transients (clicks, stamps) so
 * levelling a quiet sound up can never make it spike.
 */
import type { SfxManifest } from "../director/librarySchemas";

type Sound = Pick<SfxManifest["sounds"][number], "gain" | "loudnessDb" | "peakDb">;

/** Loudest-window RMS a gain-1 effect is levelled to (dBFS). */
export const SFX_REF_DB = -24;
/** No effect's sample peak may land above this after levelling (dBFS). */
export const SFX_PEAK_DBFS = -10;
/** Assumed for a sound with no measurement: as hot as the hottest library sound, so it stays quiet. */
export const SFX_UNMEASURED_DB = -3;
/** Multiplier on an effect while dialog is playing under it (about -6 dB). */
export const SFX_DUCK = 0.5;

const db = (x: number) => 10 ** (x / 20);

/** Ceiling on any effect's playback volume, whatever the cue asks for (a -1 dBFS file lands at SFX_PEAK_DBFS). */
export const SFX_CEILING = db(SFX_PEAK_DBFS + 1);

/** Playback volume for `sound` at a cue's `volume` (clamped to 0–1): levelled, gained, peak-capped. */
export const sfxVolume = (sound: Sound, cueVolume = 1): number => {
  const cue = Math.max(0, Math.min(1, cueVolume));
  const levelled = cue * sound.gain * db(SFX_REF_DB - (sound.loudnessDb ?? SFX_UNMEASURED_DB));
  const peakCap = db(SFX_PEAK_DBFS - (sound.peakDb ?? -1));
  return Math.min(levelled, peakCap, SFX_CEILING);
};

/** The whip-pan / hook whoosh for a program compiled before `whooshVolume` existed (whoosh.wav as measured 2026-11-08). */
export const WHOOSH_FALLBACK = sfxVolume({ gain: 0.7, loudnessDb: -15.2, peakDb: -0.7 }, 0.75);
