/** VizLab pages for The Catch's night-shift kinds (16:9, on the night sets). */
import type { FigureCue } from "../../engine";
import type { VizPage } from "./vizPages";

const cue = (at: number, c: Record<string, unknown>) => ({ at, cue: c as FigureCue });
const r = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });
const NICK = { expr: "smirk", pose: "stand", rise: 1, talk: 0, lamp: 1, beam: 20, beamLength: 0 };

export const NIGHT_PAGES: VizPage[] = [
  {
    note: "flap riffles to a value, crowd lights up, phrase card rises in",
    set: "card-vault",
    figures: [
      { id: "flap", kind: "flap", at: r(0.5, 0.16, 0.4, 0.2), params: { value: 50, unit: { prefix: "$", decimals: 2 }, caption: "in the drawer" } },
      { id: "crowd", kind: "crowd", at: r(0.5, 0.56, 0.86, 0.4), params: { count: 100, lit: 0 } },
      { id: "say", kind: "phrase", layer: "screen", hidden: true, at: r(0.33, 0.85, 0.56, 0.2), params: { lines: [{ text: "Doing a job.", color: "paper" }, { text: "Just not for us.", color: "sodium" }] } },
    ],
    cues: [cue(30, { do: "set", id: "crowd", params: { lit: 43 }, durationMs: 1800 }), cue(60, { do: "set", id: "flap", params: { value: 244 }, durationMs: 900 }), cue(90, { do: "show", id: "say" })],
  },
  {
    note: "props: drawer opens, ledger struck and stamped, jar clock spins",
    set: "ledger-room",
    figures: [
      { id: "drawer", kind: "prop", at: r(0.2, 0.6, 0.34, 0.4), params: { prop: "drawer" } },
      { id: "ledger", kind: "prop", at: r(0.52, 0.6, 0.34, 0.4), params: { prop: "ledger", cone: false } },
      { id: "debt", kind: "stamp", hidden: true, layer: "front", at: r(0.56, 0.36, 0.24, 0.14), params: { text: "DEBT" } },
      { id: "jar", kind: "prop", at: r(0.84, 0.6, 0.3, 0.4), params: { prop: "jar" } },
    ],
    cues: [cue(20, { do: "set", id: "drawer", params: { open: 1 }, durationMs: 900 }), cue(50, { do: "set", id: "ledger", params: { strike: 1 }, durationMs: 500 }), cue(70, { do: "show", id: "debt" })],
  },
  {
    note: "Nickel peeks up and talks, the headlamp sweeps; Maya holds the card; evidence lights; phone types",
    set: "evidence-board",
    figures: [
      { id: "nickel", kind: "nickel", layer: "front", at: r(0.14, 0.62, 0.24, 0.6), params: { ...NICK, rise: 0, expr: "shh", pose: "shh" } },
      { id: "maya", kind: "maya", layer: "front", at: r(0.36, 0.62, 0.22, 0.6), params: { pose: "hold", expr: "guilty" } },
      { id: "board", kind: "evidence", at: r(0.62, 0.3, 0.5, 0.36), params: { items: [{ text: "5 YEARS", sub: "before it can expire" }, { text: "UNDER $15", sub: "ask for cash" }], lit: 0 } },
      { id: "phone", kind: "phone", at: r(0.86, 0.66, 0.2, 0.56), params: { items: ["Photo every card", "Smallest first"], typed: 0 } },
    ],
    cues: [
      cue(10, { do: "set", id: "nickel", params: { rise: 1, talk: 1, beamLength: 0.6 }, durationMs: 700 }),
      cue(60, { do: "set", id: "nickel", params: { talk: 0, beam: 60, expr: "gotcha", pose: "point" }, durationMs: 900 }),
      cue(40, { do: "set", id: "board", params: { lit: 2 }, durationMs: 1400 }),
      cue(30, { do: "set", id: "phone", params: { typed: 2, done: 1 }, durationMs: 2500 }),
    ],
  },
];
