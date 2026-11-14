/**
 * Dev voice source through ElevenLabs (text to speech with timestamps):
 *   pnpm voice:elevenlabs <skitId> --voices=<voices.json> [--only=id,id]
 *
 * `voices.json` is `{ model, <speaker>: { voice, stability?, similarity?, style? } }`, keyed by cast
 * id or narrator id; `voice` is an ElevenLabs voice id. The key is `ELEVENLABS_API_KEY` from the
 * shell, or injected by the session's network proxy (then no variable is needed). Never in the repo.
 * Writes `voice/<lineId>.mp3` and `voice.json` in the voice contract's shape, with per-word start
 * times from ElevenLabs' character alignment. `--only` re-voices some lines and keeps the rest.
 * The engine never calls this (AGENTS.md, Voice): like `voice:say`, it's a dev script.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { formatDiagnostics, parseSkit, SkitError, skitLines, type VoiceManifest } from "../src/engine";
import { ROOT } from "./lib/tools";

const VoiceMap = z.object({ model: z.string().default("eleven_multilingual_v2") }).catchall(z.unknown());
const SpeakerVoice = z.object({
  voice: z.string(),
  stability: z.number().optional(),
  similarity: z.number().optional(),
  style: z.number().optional(),
  speed: z.number().optional(),
});
const Reply = z.object({
  audio_base64: z.string(),
  alignment: z
    .object({
      characters: z.array(z.string()),
      character_start_times_seconds: z.array(z.number()),
      character_end_times_seconds: z.array(z.number()),
    })
    .nullable()
    .optional(),
});

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const skitId = process.argv[2];
const voicesPath = arg("voices");
if (!skitId || !voicesPath) {
  console.error("usage: pnpm voice:elevenlabs <skitId> --voices=<voices.json> [--only=id,id]");
  process.exit(1);
}
// With a proxy-injected key the header value is a placeholder the proxy replaces.
const key = process.env.ELEVENLABS_API_KEY ?? "proxy-injected";
const map = VoiceMap.parse(JSON.parse(fs.readFileSync(voicesPath, "utf8")));
const skitDir = path.join(ROOT, "public/skits", skitId);
const only = arg("only")?.split(",");

type Line = { id: string; speaker: string; text: string; spoken?: string };
let lines: Line[];
try {
  lines = skitLines(parseSkit(JSON.parse(fs.readFileSync(path.join(skitDir, "skit.json"), "utf8"))));
} catch (e) {
  console.error(e instanceof SkitError ? formatDiagnostics(e.diagnostics) : e);
  process.exit(1);
}

const voiceOf = (speaker: string) => {
  const v = SpeakerVoice.safeParse(map[speaker]);
  if (!v.success) throw new Error(`${voicesPath} has no voice for speaker "${speaker}"`);
  return v.data;
};

/** Characters + start times → words with start/end in ms. */
export const wordsFromAlignment = (chars: string[], starts: number[], ends: number[]) => {
  const words: { text: string; startMs: number; endMs: number }[] = [];
  let cur: { text: string; startMs: number; endMs: number } | undefined;
  chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) words.push(cur);
      cur = undefined;
      return;
    }
    const s = Math.round(starts[i]! * 1000);
    const e = Math.round(ends[i]! * 1000);
    if (!cur) cur = { text: c, startMs: s, endMs: e };
    else {
      cur.text += c;
      cur.endMs = e;
    }
  });
  if (cur) words.push(cur);
  return words;
};

const speak = async (line: Line) => {
  const v = voiceOf(line.speaker);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(v.voice)}/with-timestamps?output_format=mp3_44100_128`;
  const body = {
    text: line.spoken ?? line.text,
    model_id: map.model,
    voice_settings: {
      stability: v.stability ?? 0.45,
      similarity_boost: v.similarity ?? 0.8,
      style: v.style ?? 0.3,
      ...(v.speed ? { speed: v.speed } : {}),
    },
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return Reply.parse(await res.json());
    const text = await res.text();
    if (attempt >= 3 || (res.status < 500 && res.status !== 429)) throw new Error(`${line.id}: HTTP ${res.status} ${text.slice(0, 300)}`);
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
};

const voiceDir = path.join(skitDir, "voice");
fs.mkdirSync(voiceDir, { recursive: true });
const manifestPath = path.join(skitDir, "voice.json");
const old: VoiceManifest | undefined = only && fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : undefined;
const out: VoiceManifest["lines"] = [];
for (const line of lines) {
  const kept = old?.lines.find((l) => l.id === line.id);
  if (only && !only.includes(line.id) && kept) {
    out.push(kept);
    continue;
  }
  const reply = await speak(line);
  const audio = Buffer.from(reply.audio_base64, "base64");
  for (const stale of ["wav", "ogg"]) fs.rmSync(path.join(voiceDir, `${line.id}.${stale}`), { force: true });
  fs.writeFileSync(path.join(voiceDir, `${line.id}.mp3`), audio);
  const a = reply.alignment;
  const words = a ? wordsFromAlignment(a.characters, a.character_start_times_seconds, a.character_end_times_seconds) : undefined;
  out.push({
    id: line.id,
    speaker: line.speaker,
    text: line.text,
    ...(line.spoken ? { spoken: line.spoken } : {}),
    audio: `voice/${line.id}.mp3`,
    ...(words?.length ? { words } : {}),
  });
  console.log(`${line.id} ${line.speaker}: ${words?.length ?? 0} words timed`);
}
fs.writeFileSync(manifestPath, JSON.stringify({ schemaVersion: 1, lines: out } satisfies VoiceManifest, null, 2) + "\n");
console.log(`voice:elevenlabs ${skitId}: ${out.length} lines (${map.model}) → ${path.relative(ROOT, voiceDir)}`);
