/** Who speaks a beat: the off-screen voices (the narrator and `voices`), and every beat of a document. */
import type { Beat, Narrator, SkitDoc } from "./schema";

export const isNarration = (skit: Pick<SkitDoc, "narrator" | "voices">, b: Pick<Beat, "speaker">): boolean =>
  b.speaker !== undefined && voiceOf(skit, b.speaker) !== undefined;

/** The off-screen voice (the narrator or one of `voices`) with this speaker id. */
export const voiceOf = (skit: Pick<SkitDoc, "narrator" | "voices">, speaker: string): Narrator | undefined =>
  skit.narrator?.id === speaker ? skit.narrator : skit.voices?.find((v) => v.id === speaker);

/** Every beat of a skit document, across scenes. */
export const docBeats = (d: SkitDoc): Beat[] => d.beats ?? d.scenes!.flatMap((s) => s.beats);
