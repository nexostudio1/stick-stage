"""Long video -> analysis.json: source, words, speakers, shots, face tracks.

Every step caches its output in the work dir, so a re-run only redoes what is missing.
"""

from __future__ import annotations

import json
from pathlib import Path

from . import faces, media, transcript

FACE_FPS = 4.0


def _cached(path: Path, make):
    if path.exists():
        return json.loads(path.read_text())
    data = make()
    path.write_text(json.dumps(data))
    return data


def shots_from_cuts(cuts: list[float], duration: float, min_len: float = 0.5) -> list[dict]:
    edges = [0.0]
    for c in sorted(cuts):
        if c - edges[-1] >= min_len and duration - c >= min_len:
            edges.append(round(c, 3))
    edges.append(round(duration, 3))
    return [{"id": f"s{i + 1}", "t0": a, "t1": b} for i, (a, b) in enumerate(zip(edges, edges[1:]))]


def analyse(src: Path, work: Path, sidecar: Path | None = None, shots_json: Path | None = None,
            language: str | None = None, with_faces: bool = True) -> dict:
    work.mkdir(parents=True, exist_ok=True)
    info = media.probe(src)

    wav = media.extract_audio(src, work / "audio16k.wav")
    words = _cached(work / "words.json", lambda: transcript.transcribe(wav, language=language))

    lines = transcript.read_sidecar(sidecar) if sidecar else []
    transcript.assign_speakers(words, lines)

    if shots_json:
        # An adapter's shot table (e.g. Blender markers) beats scene detection when we have one.
        shots = [{"id": s["id"], "t0": s["t0"], "t1": s["t1"]} for s in json.loads(shots_json.read_text())["shots"]]
        shots_source = "table"
    else:
        cuts = _cached(work / "cuts.json", lambda: media.scene_cuts(src))
        shots = shots_from_cuts(cuts, info["duration"])
        shots_source = "scene-detect"

    tracks: list[dict] = []
    if with_faces:
        proxy = media.make_proxy(src, work / "proxy.mp4", FACE_FPS)
        frames = _cached(work / "faces.json", lambda: faces.detect(proxy, FACE_FPS))
        tracks = faces.track(frames, shots)

    analysis = {
        "version": 1,
        "source": info,
        "speakers": sorted({w["speaker"] for w in words}),
        "words": words,
        "lines": lines,
        "shots": shots,
        "shotsSource": shots_source,
        "faces": tracks,
    }
    if lines:
        analysis["drift"] = transcript.drift_report(words, lines)
    (work / "analysis.json").write_text(json.dumps(analysis, indent=1))
    return analysis
