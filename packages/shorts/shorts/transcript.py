"""Words with times, and who said them.

Whisper (mlx) gives the words. Speakers come from a sidecar when the customer has one (an SRT with
"NAME:" prefixes, or a TSV of `id start who text`), else every word is speaker "S1". Diarization
(pyannote) slots in here later; it needs a Hugging Face token.
"""

from __future__ import annotations

import csv
import os
import re
from pathlib import Path

# faster-whisper runs anywhere (CPU here, CUDA on a Linux worker); mlx-whisper is the Apple GPU path.
ASR = os.environ.get("SHORTS_ASR", "faster")
FASTER_MODEL = os.environ.get("SHORTS_ASR_MODEL", "large-v3")
MLX_MODEL = "mlx-community/whisper-large-v3-turbo"


def _word(text: str, t0: float, t1: float, p: float) -> dict:
    return {"text": text.strip(), "t0": round(t0, 3), "t1": round(t1, 3), "p": round(float(p), 3), "speaker": "S1"}


def transcribe(wav: Path, language: str | None = None) -> list[dict]:
    if ASR == "mlx":
        import mlx_whisper

        result = mlx_whisper.transcribe(str(wav), path_or_hf_repo=MLX_MODEL, word_timestamps=True,
                                        language=language, condition_on_previous_text=False)
        raw = [_word(w["word"], w["start"], w["end"], w.get("probability", 1.0))
               for seg in result["segments"] for w in seg.get("words", [])]
    else:
        import wave

        import numpy as np
        from faster_whisper import WhisperModel

        # Our wav is already 16 kHz mono s16; hand faster-whisper samples so it skips PyAV.
        with wave.open(str(wav)) as f:
            audio = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        model = WhisperModel(FASTER_MODEL, device="auto", compute_type="int8")
        segments, _ = model.transcribe(audio, language=language, word_timestamps=True,
                                       vad_filter=True, condition_on_previous_text=False)
        raw = [_word(w.word, w.start, w.end, w.probability) for seg in segments for w in (seg.words or [])]
    return [w for w in raw if w["text"]]


def _srt_time(s: str) -> float:
    h, m, rest = s.split(":")
    sec, ms = rest.replace(".", ",").split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def read_sidecar(path: Path) -> list[dict]:
    """Lines as {t0, t1, who, text}. t1 is None when the source has no end time."""
    lines: list[dict] = []
    if path.suffix == ".tsv":
        with path.open() as f:
            rows = [r for r in csv.reader(f, delimiter="\t") if r and not r[0].startswith("#")]
        rows.sort(key=lambda r: float(r[1]))
        for r in rows:
            lines.append({"id": r[0], "t0": float(r[1]), "t1": None, "who": r[2], "text": r[3]})
    else:
        blocks = re.split(r"\n\s*\n", path.read_text().strip())
        for b in blocks:
            parts = b.strip().splitlines()
            if len(parts) < 3:
                continue
            t0, t1 = (x.strip() for x in parts[1].split("-->"))
            text = " ".join(parts[2:])
            m = re.match(r"^([A-Za-z][\w .'-]{0,24}):\s*(.*)$", text)
            who, text = (m.group(1), m.group(2)) if m else ("S1", text)
            lines.append({"id": parts[0].strip(), "t0": _srt_time(t0), "t1": _srt_time(t1), "who": who, "text": text})
    for a, b in zip(lines, lines[1:]):
        if a["t1"] is None:
            a["t1"] = b["t0"]
    return lines


def assign_speakers(words: list[dict], lines: list[dict]) -> None:
    """Each word takes the speaker of the sidecar line its midpoint falls in (or the nearest one)."""
    if not lines:
        return
    for w in words:
        mid = (w["t0"] + w["t1"]) / 2
        inside = [ln for ln in lines if ln["t0"] - 0.25 <= mid <= (ln["t1"] or ln["t0"] + 8) + 0.25]
        best = inside[0] if inside else min(lines, key=lambda ln: abs(ln["t0"] - mid))
        w["speaker"] = best["who"]
        w["line"] = best["id"]


def drift_report(words: list[dict], lines: list[dict]) -> list[dict]:
    """Per sidecar line: when whisper heard its first word versus when the sidecar says it starts."""
    out = []
    for ln in lines:
        ws = [w for w in words if w.get("line") == ln["id"]]
        if ws:
            out.append({"line": ln["id"], "sidecar": ln["t0"], "heard": ws[0]["t0"],
                        "drift": round(ws[0]["t0"] - ln["t0"], 2)})
        else:
            out.append({"line": ln["id"], "sidecar": ln["t0"], "heard": None, "drift": None})
    return out
