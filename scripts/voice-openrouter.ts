/**
 * Dev voice source through OpenRouter's speech endpoint (Gemini TTS):
 *   pnpm voice:openrouter <skitId> --voices=<voices.json> [--only=id,id] [--lines=<script.json>]
 *
 * The same request the production Tamtree `voice` step makes (`POST /api/v1/audio/speech`), so a
 * long video made locally sounds like the nightly shorts. `voices.json` is the channel's one voice
 * map: `{ model, format, <speaker>: { voice } }`, keyed by cast id or narrator id. The key comes
 * from `OPENROUTER_API_KEY` in the shell, never from the repo. Writes `voice/<lineId>.<format>`
 * and `voice.json` in the voice contract's shape. `--only` re-voices some lines and keeps the rest.
 * `--lines` voices an ad-hoc `{ lines: [{ id, speaker, text }] }` list (auditions) into
 * `public/skits/<skitId>/` without a skit.
 * The engine never calls this (AGENTS.md, Voice): like `voice:say`, it's a dev script.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { formatDiagnostics, parseSkit, SkitError, skitLines, type VoiceManifest } from "../src/engine";
import { wavDurationMs } from "../src/node";
import { ROOT } from "./lib/tools";

const VoiceMap = z
  .object({ model: z.string(), format: z.enum(["mp3", "wav", "pcm"]).default("mp3") })
  .catchall(z.unknown());
const SpeakerVoice = z.object({ voice: z.string(), style: z.string().optional() }).passthrough();
const LinesFile = z.object({ lines: z.array(z.object({ id: z.string(), speaker: z.string(), text: z.string(), spoken: z.string().optional() })) });

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const skitId = process.argv[2];
const voicesPath = arg("voices");
if (!skitId || !voicesPath) {
  console.error("usage: pnpm voice:openrouter <skitId> --voices=<voices.json> [--only=id,id] [--lines=<file>]");
  process.exit(1);
}
const key = process.env.OPENROUTER_API_KEY;
if (!key) {
  console.error("OPENROUTER_API_KEY is not set in this shell");
  process.exit(1);
}
const map = VoiceMap.parse(JSON.parse(fs.readFileSync(voicesPath, "utf8")));
const skitDir = path.join(ROOT, "public/skits", skitId);
const only = arg("only")?.split(",");

type Line = { id: string; speaker: string; text: string; spoken?: string };
let lines: Line[];
const linesPath = arg("lines");
if (linesPath) lines = LinesFile.parse(JSON.parse(fs.readFileSync(linesPath, "utf8"))).lines;
else
  try {
    lines = skitLines(parseSkit(JSON.parse(fs.readFileSync(path.join(skitDir, "skit.json"), "utf8"))));
  } catch (e) {
    console.error(e instanceof SkitError ? formatDiagnostics(e.diagnostics) : e);
    process.exit(1);
  }

const voiceOf = (speaker: string) => {
  const v = SpeakerVoice.safeParse(map[speaker]);
  if (!v.success) throw new Error(`${voicesPath} has no voice for speaker "${speaker}"`);
  return v.data.voice;
};

/** MP3 duration from its frame headers (CBR or VBR; MPEG-1/2 layer III). */
const mp3DurationMs = (buf: Buffer): number => {
  const rates = [
    [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  ];
  const srs = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] } as Record<number, number[]>;
  let i = buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3" ? 10 + ((buf[6]! << 21) | (buf[7]! << 14) | (buf[8]! << 7) | buf[9]!) : 0;
  let ms = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1]! & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const ver = (buf[i + 1]! >> 3) & 3;
    const br = rates[ver === 3 ? 0 : 1]![(buf[i + 2]! >> 4) & 15]!;
    const sr = srs[ver]?.[(buf[i + 2]! >> 2) & 3];
    if (!br || !sr) {
      i++;
      continue;
    }
    const samples = ver === 3 ? 1152 : 576;
    const pad = (buf[i + 2]! >> 1) & 1;
    i += Math.floor(((samples / 8) * br * 1000) / sr) + pad;
    ms += (samples / sr) * 1000;
  }
  return Math.round(ms);
};

const speak = async (line: Line): Promise<Buffer> => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: map.model, input: line.spoken ?? line.text, voice: voiceOf(line.speaker), response_format: map.format }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text();
    if (attempt >= 3 || (res.status < 500 && res.status !== 429)) throw new Error(`${line.id}: HTTP ${res.status} ${body.slice(0, 300)}`);
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
};

const voiceDir = path.join(skitDir, "voice");
fs.mkdirSync(voiceDir, { recursive: true });
const manifestPath = path.join(skitDir, "voice.json");
const old: VoiceManifest | undefined = only && fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : undefined;
const ext = map.format === "pcm" ? "wav" : map.format;
const out: VoiceManifest["lines"] = [];
for (const line of lines) {
  const kept = old?.lines.find((l) => l.id === line.id);
  if (only && !only.includes(line.id) && kept) {
    out.push(kept);
    continue;
  }
  const audio = await speak(line);
  const file = path.join(voiceDir, `${line.id}.${ext}`);
  for (const stale of ["wav", "mp3"].filter((e) => e !== ext)) fs.rmSync(path.join(voiceDir, `${line.id}.${stale}`), { force: true });
  fs.writeFileSync(file, audio);
  const durationMs = ext === "mp3" ? mp3DurationMs(audio) : wavDurationMs(file);
  out.push({ id: line.id, speaker: line.speaker, text: line.text, ...(line.spoken ? { spoken: line.spoken } : {}), audio: `voice/${line.id}.${ext}`, durationMs });
  console.log(`${line.id} ${line.speaker} (${voiceOf(line.speaker)}) ${(durationMs / 1000).toFixed(1)} s`);
}
fs.writeFileSync(manifestPath, JSON.stringify({ schemaVersion: 1, lines: out } satisfies VoiceManifest, null, 2) + "\n");
console.log(`voice:openrouter ${skitId}: ${out.length} lines (${map.model}) → ${path.relative(ROOT, voiceDir)}`);
