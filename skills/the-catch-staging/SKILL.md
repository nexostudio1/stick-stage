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
- **Subtitles on, both cuts** (owner 2026-11-01: people watch muted): `"overlay": {"subtitles": true,
  "captions": {...}}`, the stick-story word-timed style. Long cut `{"y": 0.73, "fontSize": 72}` (clear
  of the source credit); short `{"y": 0.42, "fontSize": 76}` (mid-screen, above the Shorts UI). Key-phrase
  cards (2–6 words) sit in the top band, `at(0.33, 0.27, …)`, never in the subtitle band; drop a card
  rather than stack it on a figure.
- **No real brands in the picture** (owner 2026-10-31): no logos, wordmarks, mascots, signature
  colours, or cup, packaging, card or store designs; everything is drawn in the tokens above, with
  generic labels (STORE, BANK, CARD). Be extra careful with props on screen while the narrator
  names a company (Case 001's cup once had a green band and a round badge, too close to the named
  brand). A company name appears on screen only in the source credit. Titles, thumbnails,
  descriptions and hashtags don't name it; the description's source credit may.

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
- Camera: keep the night finish's slow breathing zoom and the push-ins; they must glide (camera scale
  is written at 4 decimals since f7fe7c1; never round camera values to 0.01, it reads as dropped frames).

## Voices (owner decision 2026-10-31: Google TTS)

Gemini TTS `google/gemini-3.8-flash-lite-tts` through **local Tamtree**, never `say`, Chatterbox or
Kokoro in a final render (`say` only as a timing stand-in while staging).

| Speaker | Voice |
|---|---|
| Narrator | Charon |
| Nickel | Algenib |
| Human lead (Maya) | Leda (pick another female/male Gemini voice for a new lead and record it in the case folder) |

Recipe: local flow `catch-voice`, input `{model, lines:[{id, speaker, text, tts_voice}]}`, one item per
beat (`text` = the beat's `spoken` if set, else `line`). Write `public/skits/<id>/voice/<beat>.wav` and
`voice.json` (`text` = the skit line, `spoken` = what was said, `durationMs`). Full steps and Tamtree
branch caveats: `../planning/2026-10-30-the-catch/handover.md` § Next 2. Gemini voices take ~20% longer
than `say` on short lines (Case 001 went 3:30 → 4:15), so budget runtime for that.

## Approved format (Case 001, owner 2026-10-31: "really well done")

`out/the-drawer.mp4` (4:15) and `out/the-drawer-short.mp4` (29.5 s) are the reference. Reuse, don't
reinvent:

- **Start from the generator.** Copy `../planning/2026-10-30-the-catch/cases/001-the-drawer/build_skits.py`
  into the new case folder and replace scenes, datasets and lines; keep the helpers (`fig`, `beat`,
  `show`/`hide`/`setp`/`focus`/`sfx`, `phrase`, `num`, `NICK`, `PEEK`, `duck`) and both cuts in one file.
- **Same structure:** ~10 scenes over the night sets, one chapter per scene, music bed per act,
  `whip` between scenes, five acts tagged (`hook` by 0:08, `rehook`s, one `reveal`, callback).
- **Nickel at the right moments, not rare.** Besides his own lines, he peeks (`PEEK` + `setp rise 1`
  on the key word, `duck` after) on every payoff line: the hook question, each big-number reveal,
  each stamp, the named mechanism ("breakage"), the human consequence, the rules, and he stands
  beside the phone for the "tonight" actions. One expression per peek, never the same twice in a row.
- **Every hidden figure needs a show cue.** Case 001 shipped Nickel created `hidden` with no `show`,
  so his lines played to an empty frame. Before render, check each hidden `nickel`/lead figure has a
  `show` or a `rise` cue in a beat where it speaks.
- **Short cut** in the same generator (see § The 30 s short).
- **Open: the top-left case tag.** Case 001 shows `THE CATCH · CASE 001` (`CASE_TAG`, screen layer,
  every scene). The owner liked everything except this and wants it rethought. Don't copy it into a
  new case unchanged; propose options (see handover § Open) and use the owner's pick.

## First frame and cover (owner 2026-11-01, after YouTube Studio data)

The Case 001 short lost 72% of feed viewers in the first second: it opened on scene-setting ("This is
fifty dollars…") instead of the claim.
- **Every video starts on its cover, long and short.** Frame 0 *is* the cover: 3–6 words of claim
  or question in big type (`phrase`, `hidden: false`, `reveal: "none"`), the hero object in the
  cone, Nickel pointing with his beam on it. No empty set, no fade-in, no silent hold: the first
  line is spoken over the cover (a small `focus` on the hero object), then the story cuts away.
  No brand anywhere on a cover.
- **Two covers per case, one per format**, each built once in the generator and used twice:
  `cover_long()` / `cover_short()` return the figures; the opening scene uses them as its figures
  (long: a one-line scene `cover` before the cold open; short: its first scene), and a silent
  one-scene skit renders the still from the same list, so cover and frame 0 never drift apart:
  - `<id>-cover` (16:9) → `out/<id>-cover.png`: upload as the long video's thumbnail.
  - `<id>-short-cover` (9:16) → `out/<id>-short-cover.png`: the Short's thumbnail. Shorts pick it
    from the video's frames (pick frame 0) or take this file as a custom upload.
  - Render: `pnpm still Skit out/<id>-cover.png --frame=40 --props='{"skit":"<id>-cover"}'` (same
    for `-short-cover`). Covers need no voice.
- **Long cover = curiosity question** ("Who had my $50 for 4 years?"); **short cover = the claim**
  ("Your gift card is a loan to the store"), which is also the short's first spoken line (under
  3 s). The human story comes after the claim in the short, or only in the long cut.
- Check frame 0 of both cuts and both cover PNGs before any render is handed back.

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
flat fill, a frame with two Ember elements, or 8 s without change. Check the frames of every
scene that names a company for anything that looks like its branding, and add the result to the
case's Brand check line in `sources.md`.
