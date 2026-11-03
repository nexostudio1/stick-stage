import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { library, musicLibrary, reactions, safeArea, sets, sfxLibrary } from "../src/data";
import { checkSkit, compileSkit, FIGURE_PARAMS, parseSkit, programSrt, skitLines, type SkitInput } from "../src/engine";
import { fakeVoice } from "./director-fixtures";

const compile = (skit: unknown) => {
  const doc = parseSkit(skit);
  const lines = skitLines(doc).map((l) => ({ id: l.id, text: l.text, ...(l.spoken ? { spoken: l.spoken } : {}), durationMs: 300 + l.text.split(/\s+/).length * 300 }));
  return compileSkit({ skit, voice: fakeVoice(lines), lib: library, sets, sfx: sfxLibrary, reactions, safeArea, music: musicLibrary });
};
const read = (id: string) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../public/skits", id, "skit.json"), "utf8")) as SkitInput;

describe("The Catch", () => {
  for (const id of ["the-drawer", "the-drawer-short"])
    it(`${id} compiles and passes the self-check`, () => {
      const r = checkSkit({ result: compile(read(id)), lib: library, sets, safeArea });
      expect(r.findings.filter((f) => f.level === "error")).toEqual([]);
      expect(r.ran).toEqual(expect.arrayContaining(["act-hook", "variety-change"]));
    });

  it("off-screen voices speak as voice-over with their own id, and the .srt names them", () => {
    const skit = read("the-drawer-short");
    const nickel = skitLines(parseSkit(skit)).find((l) => l.speaker === "nickel")!;
    expect(nickel.narrator).toBe(true);
    const srt = programSrt(compile(skit).program, "Narrator", { nickel: "Nickel" });
    expect(srt).toContain("Nickel: Coffee.");
    expect(srt).toContain("Narrator: Your gift card");
  });

  it("act checks flag a late hook and a missing reveal", () => {
    const skit = read("the-drawer");
    const late = { ...skit, scenes: skit.scenes!.map((sc) => ({ ...sc, beats: sc.beats.map((b) => (b.tag === "hook" ? { ...b, tag: undefined } : b.id === "v4" ? { ...b, tag: "hook" as const } : b.tag === "reveal" ? { ...b, tag: undefined } : b)) })) };
    const checks = checkSkit({ result: compile(late), lib: library, sets, safeArea }).findings.map((f) => f.check);
    expect(checks).toEqual(expect.arrayContaining(["act-hook", "act-reveal"]));
  });

  it("scene music cues the act beds", () => {
    const p = compile(read("the-drawer")).program;
    expect(p.musicCues?.map((c) => c.src)).toEqual(["music/mystery.wav", "music/build.wav", "music/drop.wav", "music/resolve.wav"]);
  });

  it("night kinds validate their params", () => {
    expect(FIGURE_PARAMS.nickel.parse({ expr: "gotcha" }).pose).toBe("stand");
    expect(() => FIGURE_PARAMS.prop.parse({ prop: "spaceship" })).toThrow();
    expect(FIGURE_PARAMS.flap.parse({ value: 2021, group: false }).tiles).toBe(1);
  });
});
