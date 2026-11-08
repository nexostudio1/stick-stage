/**
 * Act rules for act-structured stories (The Catch, plan §3): run when any beat carries a `tag`.
 * A `hook` question by 8 s; long cuts also need a `promise`, a `rehook` at least every 75 s until
 * the `reveal`, exactly one `reveal`, and a last scene that calls back to the first (same set or
 * the same hero prop).
 */
import type { CompileResult } from "../director/compile";
import type { Finding } from "./types";

export const ACT_CHECKS = ["act-hook", "act-promise", "act-rehook", "act-reveal", "act-callback"];
export const HOOK_BY_S = 8;
export const REHOOK_MAX_S = 75;
/** Shorter than this, a cut is a short: the hook alone is checked. */
export const LONG_S = 90;

const heroProps = (figs: readonly { kind: string; params: Record<string, unknown> }[] | undefined) =>
  (figs ?? []).filter((f) => f.kind === "prop").map((f) => String(f.params.prop));

export const actChecks = (result: Pick<CompileResult, "scenes" | "program">): Finding[] => {
  const p = result.program;
  const fps = p.fps;
  const tagged = result.scenes.flatMap((sc, i) => {
    const ps = p.scenes[i]!;
    return sc.skit.beats.flatMap((b) => {
      const tb = ps.timeline.beats.find((x) => x.id === b.id);
      return b.tag && tb ? [{ id: b.id, tag: b.tag, from: ps.from + tb.from, to: ps.from + tb.to }] : [];
    });
  });
  if (!tagged.length) return [];
  const out: Finding[] = [];
  const of = (t: string) => tagged.filter((b) => b.tag === t);
  const hook = of("hook")[0];
  if (!hook || hook.to > HOOK_BY_S * fps)
    out.push({ check: "act-hook", level: "error", frame: hook?.to ?? 0, message: hook ? `the hook ("${hook.id}") ends at ${(hook.to / fps).toFixed(1)} s; land the question by ${HOOK_BY_S} s` : `no "hook" beat; tag the line that asks the question` });
  if (p.durationInFrames / fps < LONG_S) return out;
  if (!of("promise").length) out.push({ check: "act-promise", level: "error", message: `no "promise" beat: tell viewers the answer is coming` });
  const reveals = of("reveal");
  if (reveals.length !== 1) out.push({ check: "act-reveal", level: "error", frame: reveals[1]?.from, message: `${reveals.length} "reveal" beats; a case has exactly one catch` });
  const end = reveals[0]?.from ?? p.durationInFrames;
  const marks = [0, ...tagged.filter((b) => b.from <= end).map((b) => b.from), end];
  for (let i = 1; i < marks.length; i++)
    if ((marks[i]! - marks[i - 1]!) / fps > REHOOK_MAX_S)
      out.push({ check: "act-rehook", level: "error", frame: marks[i - 1], message: `${((marks[i]! - marks[i - 1]!) / fps).toFixed(0)} s without a hook, rehook or reveal (max ${REHOOK_MAX_S} s)` });
  const first = result.scenes[0]!.skit;
  const last = result.scenes.at(-1)!.skit;
  const props = new Set(heroProps(first.figures));
  if (result.scenes.length > 1 && first.set !== last.set && !heroProps(last.figures).some((x) => props.has(x)))
    out.push({ check: "act-callback", level: "warning", message: `the last scene doesn't call back to the first (same set or hero prop)` });
  return out;
};
