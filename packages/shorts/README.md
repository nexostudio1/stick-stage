# shorts — long video to 9:16 shorts

Analyse a long video, pick shorts, frame them 9:16, and render them with the `ShortFromFootage`
composition (`src/app/shorts/`). Built for the shorts service: a customer sends a long video, and
we cut, frame, caption and brand the shorts, then review them in t-asset. Plan:
`~/sites/agent-orchestrator/changes/2026-11-04-shorts-service/`.

Every step reads and writes plain JSON in one work dir, so a person, Claude or a Tamtree step can
edit any step's output and re-run only what follows.

```
analysis.json   words (with times and speaker), shots, face tracks          shorts analyse
shorts.json     the picks: segments, hook, title, closing, why, overrides    written by Claude / an LLM, then `shorts snap`
framing.json    per short: spans with a layout and crop keys                 shorts frame
sheet-<id>.jpg  contact sheet: the 9:16 window on a frame of every span      shorts sheet
props-<id>.json props for ShortFromFootage                                   shorts props
```

## Setup

```bash
cd packages/shorts
uv sync --python 3.12
mkdir -p models && curl -sSL -o models/blaze_face_short_range.tflite \
  https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite
```

Whisper (`mlx-community/whisper-large-v3-turbo`, Apple Silicon) downloads on first use.

## Run

```bash
W=work/<name>
uv run shorts analyse <video> --work $W [--sidecar captions.srt|lines.tsv] [--shots shots.json] [--language en]
uv run shorts transcript --work $W          # read this, then write $W/shorts.json
uv run shorts snap --work $W                # snaps edges to words and shot cuts; warns on length, mid-line starts
uv run shorts frame --work $W [--truth groundtruth.json]
uv run shorts sheet --work $W
uv run shorts props --work $W --src-url <url or public path of the source>
cd ../.. && pnpm tsx scripts/short.ts packages/shorts/$W/props-<id>.json [--draft]
```

- `--sidecar` gives speakers: an SRT with `NAME:` prefixes or a TSV (`id start who text`).
  Without one every word is `S1` (diarization comes later; it needs a Hugging Face token).
- `--shots` replaces scene detection with a known shot table.
- `overrides` in shorts.json, per shot id: `layout: "letterbox"`, a fixed `x`, or a `target` speaker.

## Blender films (tam3d)

`blender/groundtruth.py` reads every character's on-screen head position from the `.blend` (no
rendering, a few seconds) and the shot table from the camera markers:

```bash
blender -b film.blend --python blender/groundtruth.py -- $W/groundtruth.json 6
uv run shorts analyse film.mp4 --work $W --shots $W/groundtruth.json --sidecar lines.tsv
uv run shorts score --work $W --truth $W/groundtruth.json   # how good face tracking is on this film
uv run shorts frame --work $W --truth $W/groundtruth.json   # frame from the real positions
```
