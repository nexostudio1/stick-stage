---
name: crew-episode
description: Write, stage and render an episode of the relatable three-person channel (working name "Same Three People"): Mitch, Ollie and Maya on the commuter train (later the office and the BBQ) have a 20-28 s everyday conversation with a 2-second hook, a laugh at the two-thirds mark and Maya's quiet closing thought as the train stops. Covers the premise test, beat map, line rules, shots, the platform cut, running gags, packaging (POV card, title, caption), multi-part rules, render and hand-back. Use when asked for a crew / Same Three People / train-channel episode, the next episode of this channel, or to restage crew-we-launch-monday or crew-millionaire-at-94. The team writes or approves the final jokes; drafts are placeholders.
---

# Crew episode (Same Three People)

Three friends who commute together talk about something everyone does. It is funny, and the last
line leaves the viewer thinking. The audience test is a share: "this is literally us", "tag your
Mitch". If a viewer can't picture a friend who does this, the premise is wrong.

Read first: `src/data/series/crew.json` (the series bible), the cast bibles
`src/data/characters/crew-mitch.md`, `crew-ollie.md`, `crew-maya.md`, the episode log
`../planning/2026-11-10-relatable-four-channel/episodes/README.md` (what's been used: topics,
fault, laugh lines, running-gag state), and the reference episodes
`public/skits/crew-we-launch-monday/` and `public/skits/crew-millionaire-at-94/`.
General staging: `skills/skit-director/SKILL.md`; skit format: `docs/skits.md`.

## Hard rules

1. **The team writes or approves the jokes.** Draft every line so the episode renders, but say
   in the hand-back which lines are placeholders. Never present a draft as final.
2. **Isolation.** Use only `crew-*` sets, characters and parts, the `crew` series, and per-skit
   settings. Never edit an engine default, a shared style or another channel's data to fix this
   channel. A new place is a new `crew-*` set.
3. **Each episode stands alone.** A viewer who has seen nothing else must get every line. No
   "as we said last week", no unexplained in-jokes; a running gag must also work as a plain joke.
4. **Out of bounds:** real people, real brands as the butt of the joke, men-vs-women framing,
   money, medical or legal advice. Petty is the point; mean is not.

## The cast (never swap roles)

| Id | Who | Job in every episode |
|---|---|---|
| `mitch` (`crew-mitch`, stands `far-left`, `lean-in`) | Australian, the Chaos One | Relaxed, reckless, never worried. Says the bad idea as if it's obvious. |
| `ollie` (`crew-ollie`, sits `left`) | English, the Overthinker | Panics, plans, apologises, over-prepares. |
| `maya` (`crew-maya`, sits `right`) | The Deadpan | Few words. Undercuts both. Always has the last line. |

Mitch and Ollie are the double act (one doesn't care, one cares too much). **Who's at fault
rotates**: the log records it; don't make the same one the butt two episodes running. Maya is
sometimes wrong too, but she still lands the thought.

## Premise test (write these down before any line)

1. **The behaviour**, in under 8 words, that most viewers do or know someone who does
   ("never checks the bank balance").
2. **The two sides**: what Mitch does and what Ollie does about it. Opposites are the engine.
3. **The thought**: the one sentence Maya leaves the viewer with. It reframes, it doesn't preach.
   No moral, no "and that's why…", no advice.
4. **The share line**: who the viewer will tag ("Tag your Mitch").

If 3 is a lecture or 4 is nobody, change the premise.

## Beat map (20-28 s, 9-11 lines)

| Time | Beat | Rules |
|---|---|---|
| frame 0 | **The hook**: POV card + mid-conversation wide | No title card, no "hey guys", no establishing shot. The first word is already the scene. |
| 0-2 s | **The 2-second catch**: line 1 is a complete, absurd-but-true-to-life claim | 9 words max, ends by 2.0 s with the final voices (by ~2.4 s with `say` stand-ins). It must be funny or odd **on its own**, without the reply ("I'm gonna be a millionaire at ninety-four."). |
| 2-4 s | Maya's flat reply (1-4 words) | Repeats or names the absurd part ("Ninety-four."). This is the second hook: it tells the viewer the show is on their side. |
| 4-12 s | The double act escalates | Mitch's position, Ollie's panic, each line shorter or sillier than the last; one "never?"/"wait" beat. |
| ~10-14 s | **First laugh** | A line that would work as a quote card. |
| ~14-20 s | Someone turns to Maya ("Maya, back me up.") | The set-up for her. |
| ~20-24 s | **The laugh** (`"punchline": true`) | Maya's deadpan 3-5 words, usually. The rimshot and reaction close-up come from the engine. |
| last line | **The thought**: Maya, `"punchline": false`, `pauseBeforeMs: 300`, wide | The train stops: the scene cuts to a `crew-train-station*` set. It reframes the whole talk. |
| +1.4 s | Quiet hold (`timing.tailMs: 1400`), loop to frame 1 | No sign-off, no "follow for part 2". |

Some episodes may end on the laugh instead (the log tracks the mix; aim for about 1 in 4).

**The stop is the signature.** The window scrolls the whole episode and stops when Maya lands
the thought. Always cut to the station for the last line (on the train sets).

## Line rules

- Under 12 words; most under 8. Contractions, fragments, interruptions ("—").
- Each says it their way: Mitch "mate", "hear me out", "legend"; Ollie "what if", lists of
  three, numbers; Maya questions and repeats.
- Spell numbers the way they're said ("ninety-four"); one picturable number per episode at most.
- No narrator, no "fun fact", no moral. `pnpm check` lists phrases that read model-written: fix
  every `ai-wording` warning.
- Cold-viewer read: say each line aloud as if you'd never met them. Every reference must land.

## Staging (copy the reference skit's shape)

- `"set": "crew-train-bay"`, `"style": "snappy"`, `"coldOpen": "pov"`, cast and marks exactly as
  in the reference skits. The last scene: `"set": "crew-train-station-carts"` (or
  `crew-train-station`) with `"transition": { "type": "cut" }`.
- Per-line `shot`: line 1 `wide`; singles `medium` on the speaker; `close` only for the first
  laugh's speaker or a shock, and only on a line longer than ~1 s (`closeup-hold` warns); a `wide`
  every 3-4 lines and on any line addressed to the group; the last line `wide`.
- The `closeup-budget` warnings ("two plain lines in a row") are expected: the channel cuts to
  the speaker on every line. Every other warning gets fixed.
- `timing`: `leadInMs 200`, `gapMs 120`, `tailMs 1400`.

## Running gags (reward return viewers; never required)

- **The coffee carts on the platform**: one cart in Ep 1, two carts and a queue by its end. The
  platform shot shows the current count. The cart business keeps growing in the background; the
  friends' plans don't. Update the count in the log when a set variant adds a cart.
- **Monday**: they always start things "Monday".
- **Ollie's domains**: 43 as of Ep 1; the count only goes up.

Use at most one per episode and never as the main joke.

## Packaging

- **POV card** (`overlay.pov`): starts "POV: ", 40 characters or fewer in total, names the
  situation from the viewer's side ("POV: your friend made a budget").
- **Title** (`meta.title`): 25-50 characters, the absurd claim or the situation, one picturable
  number at most ("He'll be a millionaire at 94").
- **Caption** (`meta.description`): "Every friend group has …" + "Which one are you? Tag your
  <Mitch|Ollie|Maya>."
- Hashtags: `relatable`, `stickfigure`, the topic, `friends`.

## Multi-part stories

Default: **every episode is a complete story.** No "Part 1/5" and no planned arcs at launch.

- A numbered part is only for a premise that has already outperformed (about 2x the channel's
  median views after 48 h). The sequel is its own episode: new situation, new lines, its own hook
  and thought, and a small "Part 2" in the title only. It must work for someone who never saw part 1.
- Never re-use footage, lines or a recap of the earlier part (a one-line callback is fine).
  Re-using a previous video's shots is what platforms treat as reused/unoriginal content.
- Never more than 3 parts. Never end on "follow for part 2": the episode ends on the thought.
- Continuity lives in the running gags and the characters, not in cliffhangers.

## Steps

```bash
# 1. Pick the next episode number from the log; id: crew-<slug>
#    public/skits/crew-<slug>/skit.json   (copy the reference's shape)
pnpm voice:say crew-<slug>           # macOS stand-in voices until Gemini voices are wired (B2)
pnpm check crew-<slug>               # fix everything except closeup-budget; length 20-28 s
pnpm render crew-<slug> out/crew-<slug>.mp4
```

Check the 2-second catch from `voice.json`: `leadInMs` + line 1 `durationMs` must be under
~2,400 ms with `say` (under 2,000 ms with final voices). Then watch the video, not stills: the POV
card readable, captions above the seat row, the laugh's reaction close-up, the cut to the
platform, the 1.4 s hold.

Then add the episode to the log (`episodes/README.md`) and write its script page
(`episodes/NNN-<slug>.md`, the same table as `001-we-launch-monday.md`).

## Hand-back

- Video path, length, line-1 end time, and the self-check result (any warnings besides
  `closeup-budget`).
- The premise test (behaviour, two sides, thought, share line) and who is at fault.
- Which lines are placeholders for the team.
