---
name: medieval-short
description: Make a ~30 s vertical medieval history short in Spanish (Spain) with the stick cast: pick or take a medieval topic, research and verify it, write a hook-first narrated script with a few dramatized lines, stage it on the medieval sets, voice it with ElevenLabs, lip-sync with Rhubarb, render, check and package with sources. Use when asked for a medieval short, a history short about kings, knights, battles, sieges, betrayals, medieval laws or customs, or "crea un Short sobre…" anything from the Middle Ages.
---

# Medieval short

One request in ("Crea un Short sobre una traición medieval", "busca una historia real y poco conocida"),
one checked MP4 out, plus the script, sources, titles, description and tags. The pilot is
`public/skits/medieval-ep01/` (King John's baggage in the Wash, 1216): copy its shape, not its jokes.

## 1. Pick and verify the story
- If the person names no story, choose one that is real, surprising, evergreen and not only English:
  absurd royal decisions, legendary warriors, odd laws and punishments, sieges and escapes,
  inventions, daily life, mistakes with big consequences. Rotate regions and centuries across episodes.
- Search the web. Confirm names, dates and places in at least two reliable sources. Split what is
  documented from what is legend. If the core is legend, say so in the narration; if sources are thin,
  pick another story.
- Write `public/skits/<id>/research.md` like the pilot's: facts, legend/uncertain, recreations
  (every invented line), sources (URLs + primary texts), 3 titles, description, tags.

## 2. Script (≈30 s at natural speed)
- 0–3 s hook: a conflict on the first frame and a first line like «Este rey perdió su tesoro… por
  elegir mal el camino». Never «Hoy vamos a hablar de…». The title's promise is said in the first line.
- 3–8 context (who, where, year as a `pov` card), 8–15 the problem, 15–22 it gets worse (shown,
  not only told), 22–27 the reveal or twist (what really happened / what is myth), 27–30 a memorable
  end (consequence, sharp line, or a card). No goodbye.
- Narrator carries the story (`speaker: "narrator"`); 2–4 short in-scene lines (`speaker` = cast)
  for life. Humor from the situation; on tragedies keep it serious. Years and numbers in `line` as
  digits, spoken in words via `spoken`.
- Spanish from Spain, plain and direct, as if telling a friend.

## 3. Stage it (`docs/skits.md`, skit-director rules)
- Cast (catalog, reuse and vary with accessories/colours via workspace `characters`): `med-rey`,
  `med-soldado`, `med-carretero`. Wear: `crown-01`, `kettle-hat`, `hood-01`, `tunic-01`, `mail-01`,
  `cape-01` (`src/engine/rig/medievalWear.tsx`). New roles (knight, monk, merchant, archer): add an
  accessory there and a character + bible in `src/data/characters/`.
- Sets (kit `medieval`): `fen-1`, `fen-convoy` (side tracking), `fen-sinking` (cold-open hook),
  `fen-flood` (water in front of the cast), `medieval-road-1` (tracking), `castle-hall-1`,
  `crown-dark` (insert), `medieval-black` (end cards). Parts: `fen`, `flood-water`, `medieval-road`,
  `castle-hall`, `crown-relic`, `cart`, `horse`. A new place = a new part in
  `src/engine/set/parts/medieval*.tsx` + `PART_INFO` + a set JSON; check it in SetLab
  (`--props='{"kits":["medieval"]}'`). No fantasy in historical episodes unless it is the legend.
- One scene per story beat, cuts with intent (`whip` for travel/time, `fade` into reveals, `cut` to
  black). Walks with `walkTo`, gestures on their word, reactions on silent beats, the closing stare as
  a silent close-up. Card scene for the last line.
- Music: `medieval` (story) and `medieval-tense` (danger) as scene `music` cues. SFX: `splash`,
  `water-rush`, `creak`, `hooves`, `sword-clang`, `war-drum` plus the library; 1–3 per scene, never
  over a line's key word.

## 4. Voices, lip-sync, render
```
pnpm voice:eleven <id>                 # ElevenLabs v3, natural speed, word timings; keeps unchanged lines
pnpm direct <id> --json                # Rhubarb mouths (pnpm bootstrap installs it), compile, check, sheet, MP4
pnpm batch <id>                        # out/posts/<id>/: mp4, srt, txt, json
```
Narrator voice id on `narrator.voice.voiceId`, cast voices on each character's `voice.voiceId`.
Never speed audio up artificially; adjust pauses and cut lines instead.

## 5. Check before handing back
Read `generated/direct.json` (fix every error, weigh warnings; `narrator-dominant` is expected) and
look at `out/<id>-sheet.png`: hook visible on frame 0, no broken limbs, props in place, faces clear of
subtitles, the reveal readable, the end lands. Re-check facts against `research.md`. Then hand back
the MP4, titles, description, tags and the research file. Do not reuse the same jokes, moves or
structure beats from earlier episodes.
