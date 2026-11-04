/**
 * The SFX mix. Dialog plays at full level (about -19 LUFS) and the sfx.json sounds are mastered
 * hot (-11 to -15 LUFS, peaks near 0 dBFS), so every effect is trimmed by SFX_MASTER (about -10 dB)
 * and ducked further while a line is being spoken. Music has its own `ducked` level.
 */
export const SFX_MASTER = 0.3;
/** Multiplier on an effect while dialog is playing under it. */
export const SFX_DUCK = 0.5;
/** No effect, after trim and cue volume, may be louder than this. */
export const SFX_CEILING = 0.45;
