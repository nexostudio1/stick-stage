---
name: shorts-editor
description: Cut a customer's long video into 9:16 shorts and act on review notes — pick the shorts from the transcript, write shorts.json, snap, frame, check the contact sheets, render drafts, and turn each review comment (with its time range) into an edit of shorts.json or framing overrides, then re-render and reply. Use when asked to make shorts from footage, a podcast, an interview, a film or a long video, or to apply review comments on such shorts. Never approves or releases a short.
---

# Shorts editor

You are the editor's hands for the shorts service. The pipeline is `packages/shorts` (Python) plus
the `ShortFromFootage` composition (`src/app/shorts/`). Read `packages/shorts/README.md` for the
commands. Every step's output is a JSON file in one work dir, and you edit those files directly.

## Picking shorts (writing shorts.json)

Run `uv run shorts transcript --work $W` and read all of it before choosing. A short is good when:

1. **It is a complete thought.** It has a setup and a payoff. Never end before the explanation;
   that is the top complaint about AI clippers.
2. **It works cold.** No "as I said earlier" or names the viewer hasn't met, unless the clip itself
   introduces them.
3. **It hooks in the first 2 s.** Either the main segment opens strong, or add a **teaser**
   segment: 2–5 s of the payoff line, played first, then the main segment from the start.
4. **20–60 s in total**, teaser included. If the moment is longer, split it into several `main`
   segments that skip the slack. Each jump is a cut with an audio fade.
5. **Not a repeat.** Shorts from the same video shouldn't share their payoff.

For each short write `title` (≤ 6 words, on screen after the teaser), `hook` (on-screen text over
the opening, ≤ 8 words, a question or a claim), `closing` (the end card line: the moral, the fact
or the CTA), and `why` (two plain sentences for the reviewer: what the viewer gets and why it
works cold). Then run `shorts snap` and fix every `!` it prints.

## Framing

`shorts frame` → `shorts sheet`, then **look at every contact sheet** (`sheet-<id>.jpg`, Read the
image). The yellow box is the 9:16 window, and an orange border means letterbox. Fix bad spans
with `overrides` in shorts.json, keyed by shot id:

- the window is on the wrong person: `{"target": "<speaker>"}`, or a fixed `{"x": 0.62}`
- nobody fits, a wide, a plate, a screen recording: `{"layout": "letterbox"}`

Re-run `frame` and `sheet` after each change. Keep overrides: they survive a re-plan.

## Rendering

`shorts props --work $W --src-url <source path>` then
`pnpm tsx scripts/short.ts $W/props-<id>.json --draft` for review rounds (540×960, fast).
Render final (no `--draft`) only after approval.

## Acting on review comments

Each comment has a time range in the **short's** timeline. Map it to the source with
framing.json's spans (`out0`, `src0`): source time = `src0 + (t - out0)`.

| The note says | Edit |
|---|---|
| start later / earlier, cut this bit, too long | segment `t0`/`t1`, or split a `main` in two around the cut; then `snap` |
| a different hook / opening | a new teaser segment, or new `hook` text |
| wrong person in frame, cropped head | `overrides[shot]` target, x, or letterbox |
| caption word wrong | fix the word's `text` in analysis.json `words` (keep the times) |
| title, closing line, CTA | the field in shorts.json |
| anything you can't do from these files (reshoot, new graphics, music, a logo we don't have) | don't guess: reply that it needs the editor, and say what's needed |

After the edits: `snap`, `frame`, `sheet` (look), `props`, render the draft, and reply to each
comment in one line saying what changed ("Starts on her answer now, 0:03 shorter").

## Never

- approve, release or publish a short. People do that in t-asset.
- change the words a speaker said, other than fixing a mis-heard caption.
- use footage outside the customer's source.
