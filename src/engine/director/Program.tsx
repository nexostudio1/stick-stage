import { withProgramAssets } from "./places";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Freeze, Html5Audio, Sequence, staticFile } from "remotion";
import { Skit, type SkitProps } from "./Skit";
import type { Program, SceneTransition } from "./timeline";
import type { SetDef } from "../set/schema";

export type SkitProgramProps = Omit<SkitProps, "timeline" | "set"> & {
  program: Program;
  sets: Readonly<Record<string, SetDef>>;
};

// The presentations differ only in their props type; TransitionSeries accepts any of them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (t: SceneTransition, width: number, height: number): TransitionPresentation<any> => {
  switch (t.type) {
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "clock-wipe":
      return clockWipe({ width, height });
    case "whip":
      return slide({ direction: "from-right" });
    default:
      return fade();
  }
};

/** Quiet in the gaps, ducked under dialog, silent on the punchline. Scene `music` cues change the bed. */
const Bed: React.FC<{ program: Program; audio?: boolean }> = ({ program, audio = true }) => {
  const runs = [...(program.music ? [{ frame: 0, ...program.music }] : []), ...(program.musicCues ?? [])].sort((a, b) => a.frame - b.frame);
  if (!audio || !runs.length) return null;
  const talking = (frame: number) =>
    program.scenes.some((sc) => sc.timeline.audio.some((a) => frame >= sc.from + a.frame && frame < sc.from + a.frame + a.durationFrames));
  // An act-cued skit (The Catch) keeps its bed under the catch line; a comedy skit drops it.
  const punch = (frame: number) =>
    !program.musicCues?.length && program.scenes.some((sc) => sc.timeline.beats.some((b) => b.punchline && b.kind === "line" && frame >= sc.from + b.from && frame < sc.from + b.to));
  const fadeIn = Math.round(program.fps * 0.4);
  return (
    <>
      {runs.map((r, i) => {
        const end = runs[i + 1]?.frame ?? program.durationInFrames;
        return end > r.frame ? (
          <Sequence key={`bed-${i}`} from={r.frame} durationInFrames={end - r.frame} layout="none">
            <Html5Audio src={staticFile(r.src)} loop volume={(f) => Math.min(1, (f + 1) / fadeIn) * (punch(r.frame + f) ? 0 : talking(r.frame + f) ? r.ducked : r.gain)} />
          </Sequence>
        ) : null;
      })}
    </>
  );
};

/** A whoosh under every whip-pan. */
const Whips: React.FC<{ program: Program; audio?: boolean }> = ({ program, audio = true }) =>
  audio ? (
    <>
      {program.scenes.map((sc) =>
        sc.transitionIn?.type === "whip" ? (
          <Sequence key={`whip-${sc.id}`} from={Math.max(0, sc.from - 2)} durationInFrames={Math.round(program.fps * 0.6)} layout="none">
            <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.7} />
          </Sequence>
        ) : null,
      )}
    </>
  ) : null;

/** A compiled skit: its scenes in order, joined by their transitions. A teaser or slam hook plays first. */
export const SkitProgram: React.FC<SkitProgramProps> = ({ program, sets: catalogSets, lib: catalogLib, ...props }) => {
  // Places composed at compile time, and workspace characters and props, ride on the program.
  const sets = program.sets ? { ...catalogSets, ...program.sets } : catalogSets;
  const rest = { ...props, lib: withProgramAssets(catalogLib, program), finish: program.finish };
  const hook = program.hook;
  const hookScene = hook ? program.scenes[hook.scene] : undefined;
  const picture = hook && hookScene ? (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={hook.prefixFrames}>
        <Freeze frame={hook.frame}>
          <Skit timeline={hookScene.timeline} set={sets[hookScene.timeline.set]!} {...rest} audio={false} />
        </Freeze>
        {rest.audio !== false ? <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.8} /> : null}
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: hook.transitionFrames })} />
      {program.scenes.map((sc) => (
        <React.Fragment key={sc.id}>
          {sc.transitionIn && sc.transitionIn.durationFrames > 0 ? (
            <TransitionSeries.Transition presentation={presentation(sc.transitionIn, program.width, program.height)} timing={linearTiming({ durationInFrames: sc.transitionIn.durationFrames })} />
          ) : null}
          <TransitionSeries.Sequence durationInFrames={sc.timeline.durationInFrames}>
            <Skit timeline={sc.timeline} set={sets[sc.timeline.set]!} {...rest} />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
  ) : (
    program.scenes.length === 1 ? (
      <Skit timeline={program.scenes[0]!.timeline} set={sets[program.scenes[0]!.timeline.set]!} {...rest} />
    ) : (
    <TransitionSeries>
      {program.scenes.map((sc) => (
        <React.Fragment key={sc.id}>
          {sc.transitionIn && sc.transitionIn.durationFrames > 0 ? (
            <TransitionSeries.Transition
              presentation={presentation(sc.transitionIn, program.width, program.height)}
              timing={linearTiming({ durationInFrames: sc.transitionIn.durationFrames })}
            />
          ) : null}
          <TransitionSeries.Sequence durationInFrames={sc.timeline.durationInFrames}>
            <Skit timeline={sc.timeline} set={sets[sc.timeline.set]!} {...rest} />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
    )
  );
  return (
    <AbsoluteFill>
      {picture}
      <Bed program={program} audio={rest.audio} />
      <Whips program={program} audio={rest.audio} />
    </AbsoluteFill>
  );
};
