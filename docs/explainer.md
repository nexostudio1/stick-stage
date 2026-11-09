# Explainers: narrated 16:9 data stories

An explainer is a skit with `"format": "explainer"`: an 8–12 minute narrated widescreen video built
from figures, with no cast on stage. Everything else (voice contract, prep, compile, check, render,
Tamtree's check-only step) works as for any skit. Worked example: `public/skits/costco-margins/`
(a 38 s look sample with made-up numbers).

What the format changes:

- `meta.aspect` defaults to `16:9` (set `9:16` for a Shorts cut-down of the same doc).
- `cast` may be empty when there is a `narrator`.
- The directing style defaults to `explainer`: story pacing, no punchline rules, QA length band 5–15 min.
- QA adds the variety rules below, and the check report carries a `fingerprint`.

## Grounds

`explainer-paper` (light, ink figures), `explainer-night` (dark, chalk figures), and the science
themes at 16:9: `explainer-dawn` (time, the Earth, the Sun), `explainer-tide` (sea, tides, the
Moon), `explainer-cosmos` (space; dark, chalk figures) and `explainer-lab` (chemistry, life). Each
theme drifts slowly and keeps its shapes to the frame's edges, faded behind the centre where the
figures sit. Pick the theme that fits the chapter and alternate across a long video. No furniture:
the frame is for figures.

The blueprint grounds (`explainer-grid`, `explainer-drafting`, `explainer-drafting-indigo`, and
`blueprint-1` for shorts) are **retired**: they still draw, so old videos re-render unchanged, but
`GET /sets` hides them and the compiler warns (`set-retired`) a skit that picks one.

A scene with no cast holds one wide frame (figure `focus` cues still move the camera). In a cast
scene, a figure on `"layer": "screen"` (a caption card, an inset) appears without the cut to wide.

`"lettering": "hand"` (skit level) sets cards, slams, the POV card and figure labels in Kalam Bold,
hand-lettered to sit with drawn figures; subtitles and credits stay on the text font.

## Placing figures: slots

Give a figure `"slot"` instead of `at`. Slots keep the bottom band free for captions.

| Slot | Where (16:9) |
|---|---|
| `full` | the whole picture area |
| `left` / `right` | half each, side by side (a comparison) |
| `center` | a big single number or small chart |
| `top` | a title strip |
| `lower-third` | a name or a fact, bottom left |
| `inset` | a small box top right |

## Data: facts come from code

```json
"datasets": {
  "margins": {
    "columns": ["store", "gross_pct"],
    "rows": [["Costco", 12.6], ["Walmart", 24.1]],
    "source": { "name": "Company 10-K filings", "url": "https://…", "retrieved": "2026-10-01" }
  }
}
```

The first column is the key. Tamtree's data nodes fill these; the writer never types a number into
a figure. Figure params reference them:

- `"@margins.gross_pct"`: the column as `[[key, value], …]` (a series, bars, a choropleth).
- `"@margins.gross_pct[Costco]"`: one number (a counter's `value`).

Beats tag the numbers they say, and the compiler checks each one rounds to its cell (a column in
billions matches "4.8 billion" or "4.8"). A wrong number fails compile with `number-mismatch`; a
number the line doesn't contain fails with `number-not-said`.

```json
{ "id": "n4", "speaker": "narrator", "line": "Costco keeps about 13 cents.",
  "numbers": [ { "text": "13", "data": "@margins.gross_pct[Costco]" } ] }
```

Every dataset's `source` goes in the post text under "Sources", and on screen (bottom right) while
a figure built from it is up. `"illustrative": true` marks made-up numbers, on screen and in the text.

## Moving the camera: focus

```json
{ "do": "focus", "id": "bars", "at": { "word": "Costco" } }
{ "do": "focus", "id": "bars", "part": "right", "zoom": 1.6 }
{ "do": "focus", "id": "none" }
```

A focus eases the camera onto a figure (fitted above the captions) or one of its anchors (`part`,
which may crop), and holds until the next focus. `"none"` pulls back out. Figures on
`layer: "screen"` stay put.

## Chapters

`"chapter": "Thin margins"` on a scene starts a YouTube chapter there. The post text lists them
(`0:00 …`), with an "Intro" at 0:00 if the first scene has none. YouTube needs at least three, each
at least 10 s: the compiler warns otherwise.

## Variety rules (QA)

YouTube demonetises "content that looks like it's made with a template", so these are self-check
**errors** for an explainer:

| Check | Rule |
|---|---|
| `variety-kinds` | at least 6 distinct figure kinds per 8 minutes (pro rata, at least 2) |
| `variety-run` | no kind leads more than 3 spoken beats in a row |
| `variety-change` | something new on screen (a figure shown, changed or focused, a scene change, a card) at least every 8 s |
| `variety-hook` | something moves in the first 3 s |

Across videos StickStage is stateless: a render's `check.fingerprint` (figure order, layout, sets,
opening) is for the caller to keep. Pass the last 30, most recent first, as render option
`history: [fingerprint, …]` and the check warns (`sameness`) when the new video scores 0.8 or more
against one of them, or opens with the same figures as one of the last five.

## Long renders

An 8-minute video is 14,400 frames: more than one 15-minute Lambda. The render cuts the program
into segments at scene changes, at most a minute each. On Lambda the invocation Tamtree calls
fans them out over up to 8 copies of itself and joins the pieces (`lambda/fanout.ts`, setup in
`lambda/README.md`). Locally and in `pnpm serve` they render one after another and are cached, so
editing one scene re-renders only that scene.

## The night-shift look (The Catch)

Worked example: `public/skits/the-drawer/` (Case 001, 3:30) and its 9:16 short
`public/skits/the-drawer-short/`. Skills: `the-catch-story`, `the-catch-staging`.

- `"finish": "night"`: grain, a heavy vignette and a camera that never stops drifting
  (`shots/nightFinish.tsx`). The variety rule tightens to a change every **4 s**.
- Sets (kit `night`, `anyAspect`, so the same set serves the 16:9 cut and the 9:16 short):
  `kitchen-night`, `card-vault`, `ledger-room`, `cafe-night`, `lost-and-found`, `evidence-board`,
  `bookshop-morning` (the first daylight, for the callback). Lamps flicker and dust drifts in the light.
- Figure kinds: `flap`, `crowd`, `stamp`, `phrase`, `prop`, `nickel`, `maya`, `evidence`, `phone`
  (`docs/figures.md`). Data is a thing in the world, never a chart on a fill.
- Captions: `"overlay": { "subtitles": false }`; on screen, 2–6 word `phrase` cards on
  `layer: "screen"`. The full script still goes to the `.srt`.
- **Off-screen voices.** `"voices": [{ "id": "nickel", "name": "Nickel", "voice": { … } }]` beside
  the `narrator`: hosts drawn as figures speak voice-over lines with their own voice. Cue the
  puppet's mouth with `set` `{ "talk": 1 }` at the line's first word and `{ "talk": 0 }` at
  `{ "fraction": 0.95 }`.
- **Act music.** A scene's `"music": "mystery" | "build" | "drop" | "resolve"` changes the bed
  from that scene on (synthesized, `pnpm music`). Act-cued skits keep the bed under the punchline.
- **Act tags.** `"tag": "hook" | "promise" | "rehook" | "reveal"` on beats turns on `qa/acts.ts`:
  the hook ends by 8 s; over 90 s also a promise, a rehook at least every 75 s until the reveal,
  exactly one reveal, and a last scene that calls back to the first (set or hero prop).
- Transitions: `"whip"` (a fast slide with a whoosh) and `"cut"` (a match cut).
- **Shorts.** Every long case ships a ≤ 30 s 9:16 cut (hook, one clue, cliffhanger; never the
  catch itself) with `meta.links` (`{{LONG_URL}}` until the long video is up). The post text prints
  the links first.
