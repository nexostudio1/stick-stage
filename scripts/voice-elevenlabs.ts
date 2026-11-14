/**
 * ElevenLabs voices for a skit: pnpm voice:eleven <skitId> [--model=eleven_v3|eleven_multilingual_v2] [--force]
 *
 * Dev/standalone mode (D1), like voice:tts: the engine and the render service never call it.
 * Each spoken beat gets `voice/<beatId>.mp3` plus word timings from the API's character
 * alignment, written to `voice.json` (docs/voice-contract.md). Voices come from the speaker's
 * character (`voice.voiceId`, provider "elevenlabs") or the skit's `narrator.voice.voiceId`.
 * A line whose text did not change is kept (no new request) unless --force.
 * The key is never in the repo: set ELEVENLABS_API_KEY, or run where a proxy injects it.
 * Node's fetch needs NODE_USE_ENV_PROXY=1 behind a proxy (the package script sets it).
 */
import fs from "node:fs";
import path from "node:path";
import { library } from "../src/data";
import { ROOT } from "./lib/tools";

type Beat = { id: string; speaker?: string; line?: string; spoken?: string; silent?: boolean };
type Word = { text: string; startMs: number; endMs: number };
type Line = { id: string; speaker: string; text: string; spoken?: string; audio: string; durationMs: number; words: Word[] };

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const flag = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
if (!id) {
  console.error("usage: pnpm voice:eleven <skitId> [--model=eleven_v3] [--force]");
  process.exit(2);
}
const dir = path.join(ROOT, "public/skits", id);
const skit = JSON.parse(fs.readFileSync(path.join(dir, "skit.json"), "utf8"));
const model = flag("model") ?? "eleven_v3";
const force = args.includes("--force");

const beats: Beat[] = (skit.beats ?? skit.scenes.flatMap((s: { beats: Beat[] }) => s.beats)).filter((b: Beat) => !b.silent && b.line);
const castChar = (who: string): string => skit.cast.find((c: { id: string }) => c.id === who)?.character ?? who;
const voiceOf = (who: string): string => {
  if (who === "narrator" || who === skit.narrator?.id) {
    const v = skit.narrator?.voice?.voiceId;
    if (!v) throw new Error(`skit ${id}: narrator.voice.voiceId is missing`);
    return v;
  }
  const charId = castChar(who);
  const c = (skit.characters ?? []).find((x: { id: string }) => x.id === charId) ?? (library.characters as Record<string, { voice?: { voiceId?: string } }>)[charId];
  const v = c?.voice?.voiceId;
  if (!v) throw new Error(`skit ${id}: character "${charId}" has no voice.voiceId`);
  return v;
};

const vf = path.join(dir, "voice.json");
const old: Line[] = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, "utf8")).lines : [];
fs.mkdirSync(path.join(dir, "voice"), { recursive: true });

const settings = model === "eleven_v3" ? { stability: 0.5 } : { stability: 0.4, similarity_boost: 0.8, style: 0.45 };
const lines: Line[] = [];
for (const b of beats) {
  const speaker = b.speaker ?? "narrator";
  const say = b.spoken ?? b.line!;
  const prev = old.find((l) => l.id === b.id && l.text === b.line && (l.spoken ?? l.text) === say && l.speaker === speaker);
  if (prev && !force && fs.existsSync(path.join(dir, prev.audio))) {
    lines.push(prev);
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceOf(speaker)}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "proxy-injected", "content-type": "application/json" },
    body: JSON.stringify({ text: say, model_id: model, voice_settings: settings }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} for ${b.id}: ${await res.text()}`);
  const j = (await res.json()) as { audio_base64: string; alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } };
  const audio = `voice/${b.id}.mp3`;
  fs.writeFileSync(path.join(dir, audio), Buffer.from(j.audio_base64, "base64"));
  const { characters: ch, character_start_times_seconds: st, character_end_times_seconds: en } = j.alignment;
  const words: Word[] = [];
  let cur: Word | null = null;
  ch.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    cur ??= { text: "", startMs: Math.round(st[i]! * 1000), endMs: 0 };
    cur.text += c;
    cur.endMs = Math.round(en[i]! * 1000);
  });
  if (cur) words.push(cur);
  const durationMs = Math.round(en[en.length - 1]! * 1000) + 120;
  lines.push({ id: b.id, speaker, text: b.line!, ...(b.spoken ? { spoken: b.spoken } : {}), audio, durationMs, words });
  console.log(`  ${b.id} (${speaker}) ${durationMs} ms: ${say}`);
}
fs.writeFileSync(vf, JSON.stringify({ schemaVersion: 1, lines }, null, 2) + "\n");
console.log(`voice:eleven ${id}: ${lines.length} lines (${model})`);
