---
name: the-catch-staging
description: Turn a "The Catch" script into a storyboard and StickStage explainer skit in the night-shift world: Nickel the raccoon (ember hoodie, headlamp), the human lead, data as objects in the world (split-flap boards, coin stacks, neon lines, stamps, evidence boards), camera, music and SFX cues, and the variety rules. Use after the-catch-story, or when asked to storyboard, stage, restage or render a The Catch case.
---

# The Catch: staging

Look bible: `../planning/2026-10-30-the-catch/frames/` (01–05 world, nickel-01..04 host) and
plan §4–§6. Engine reference: `skills/explainer/SKILL.md`, `docs/explainer.md`, `docs/figures.md`.
Renders run on **local Tamtree** (no Lambda 15 min limit), so long cases are fine.

## World rules

- **Night everywhere** except the final callback, which may be the first daylight of the video.
- Palette: Night `#0E1A24` ground, Teal surfaces, Paper words, **one** Sodium hero per frame
  (the answer, the light), **at most one** Ember element (loss, alarm, stamp), Neon only for data lines.
- Fonts: Bricolage Grotesque (key phrases), Big Shoulders Display (numbers), IBM Plex Mono (labels, sources).
- No boxed word captions. On screen: 2–6 word key-phrase cards timed to the word. Full captions → `.srt`.

## Data as objects (never a chart on a plain fill)

| Need | Object | Kind |
|---|---|---|
| One big number | Split-flap board that clacks to the value | `flap` |
| Compare 3–6 values | Line-up: coin stacks / pallets / cups against a height wall | `stacks` (planned) / `prop` `cups` today |
| Growth over time | Neon tube on a wall drawing on | `line` variant `neon` (planned) |
| Share of people | Crowd of 100 silhouettes, some lit | `crowd` |
| A rule / verdict | Rubber stamp slam | `stamp` |
| Where / a list of rules | Evidence board: pinned cards + red string | `evidence` (on set `evidence-board`) |
| A thing in the story | Hero prop under a light cone | `prop` (`drawer`, `envelope`, `giftcard`, `till`, `ledger`, `jar`, `cups`, `coins`, `vault`, `cup`, `lostbox`, `book`) |
| Words on screen | Key-phrase card, 2–6 words | `phrase` on `layer: "screen"` |
| Advice to act on | A phone note typed and ticked | `phone` |

Engine reference for all of these: `docs/explainer.md` § The night-shift look. Mark kinds that
don't exist yet as planned in the storyboard so the build list stays honest.

## Nickel

- Night Shift design (`frames/nickel-01.png` B): ember hoodie, ears through the hood, headlamp.
  In the engine he is the `nickel` figure kind and speaks as an off-screen voice (`voices`);
  `rise` peeks him up over a counter, `beam` / `beamLength` aim the headlamp.
- On screen in ~30% of shots; the headlamp beam is how reveals are lit (the beam lands, the number flips).
- Expressions: `smirk`, `sly`, `shock`, `grin`, `gotcha`, `shh`. One reaction per reveal, never
  two in a row with the same face.
- Nickel never stands next to a chart pointing at it like a presenter. Nickel sneaks, opens, finds, reacts.

## Human lead

- Toon tier (`skills/toon-character/SKILL.md`). Appears in the cold open, the human turn and the
  callback. Their object (the card) is the transition between their world and the money world
  (match cut: card in the drawer → card on the vault floor).

## Motion and sound per beat

- A visual change every ≤ 4 s; camera always drifting; a push-in on every reveal; whip-pan or match cut between scenes.
- Each cue names its SFX: flap `clack` per tile, coin `clink`, stamp `thud`, scene `whoosh`,
  money reveal `register`, drawer `slide`. Music: `mystery` (open, clues), `build` (last clue),
  `drop` on the catch line, `resolve` (verdict). Duck under the voice.
- Voice pace: `fast` (~190 wpm). Narrator lines `pace: "fast"`; Nickel a separate, short, dry voice.

## The 30 s short (every case)

Every 16:9 case also ships a ≤ 30 s 9:16 cut for the **Thin Lines Theory** channel that sends
viewers to the long video: the hook, one clue with its best number, Nickel's reaction, then
"Full case, linked below." Never give away the catch. Same sets and kinds (the night sets fit
9:16). `meta.links` first item `{ "label": "▶ Full case (<title>)", "url": "{{LONG_URL}}" }`;
after upload also set the Short's YouTube "related video" to the long one and pin a comment with
the link. Worked example: `public/skits/the-drawer-short/`.

## storyboard.md format

One row per beat: `#`, time, speaker, line, picture (set, objects, Nickel/lead action), camera,
cue word → action, SFX, music. Then a "Build needs" list (sets, kinds, props, poses) with
planned/exists.

## Checks before render

`pnpm check <id>`: variety (kinds per length, runs, 4–8 s changes, 3 s hook), `numbers` match
datasets, wording. Frame sheet as in the explainer skill; reject any frame that is a chart on a
flat fill, a frame with two Ember elements, or 8 s without change.
