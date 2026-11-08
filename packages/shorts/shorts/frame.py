"""9:16 crop paths: framing.json.

For every short, its segments are split at shot cuts into spans. Each span gets a layout:
  single     a 9:16 window that follows the active speaker
  letterbox  the whole 16:9 frame over a blurred fill (wides, plates, nobody to follow)
and, for `single`, keys of the window centre `x` (0..1 of source width) at source times.

Who to follow: the speaker of the word at that moment, else the last speaker within 1.5 s.
Where they are: Blender ground truth when given (`--truth`), else face tracks (largest face, held
across frames; no diarization binding yet). A dead zone stops small moves panning the camera.
"""

from __future__ import annotations

import json
from pathlib import Path

STEP = 0.25
DEAD_ZONE = 0.06
SMOOTH = 0.35          # fraction of the remaining distance closed per step (~1 s pans)
HOLD_SPEAKER = 1.5


def window_frac(src_w: int, src_h: int, out_w: int = 1080, out_h: int = 1920) -> float:
    return min(1.0, (src_h * out_w / out_h) / src_w)


def speaker_at(words: list[dict], t: float) -> str | None:
    cur = next((w for w in words if w["t0"] - 0.05 <= t <= w["t1"] + 0.05), None)
    if cur:
        return cur["speaker"]
    prev = [w for w in words if w["t1"] <= t and t - w["t1"] <= HOLD_SPEAKER]
    return prev[-1]["speaker"] if prev else None


class TruthPositions:
    def __init__(self, truth: dict):
        self.samples = truth["samples"]

    def at(self, t: float, shot: str, who: str | None) -> tuple[float | None, list[float]]:
        s = min((x for x in self.samples if x["shot"] == shot), key=lambda x: abs(x["t"] - t), default=None)
        if not s:
            return None, []
        visible = [v[0] for v in s["chars"].values() if v[2]]
        if who and who in s["chars"] and s["chars"][who][2]:
            return s["chars"][who][0], visible
        return None, visible


class FacePositions:
    def __init__(self, tracks: list[dict]):
        self.tracks = tracks

    def at(self, t: float, shot: str, who: str | None) -> tuple[float | None, list[float]]:
        here = []
        for tr in self.tracks:
            if tr["shot"] != shot:
                continue
            p = min(tr["points"], key=lambda p: abs(p["t"] - t))
            if abs(p["t"] - t) <= 0.6:
                here.append(p["box"])
        if not here:
            return None, []
        xs = [b[0] + b[2] / 2 for b in here]
        biggest = max(here, key=lambda b: b[2] * b[3])
        return biggest[0] + biggest[2] / 2, xs


def plan_span(src0: float, src1: float, shot: str, words: list[dict], pos, half: float,
              override: dict | None) -> dict:
    override = override or {}
    if override.get("layout") == "letterbox":
        return {"layout": "letterbox"}
    keys, x, seen = [], None, 0
    t = src0
    while t <= src1 + 1e-6:
        who = override.get("target") or speaker_at(words, t)
        target, visible = pos.at(t, shot, who)
        if target is None and visible:
            target = sum(visible) / len(visible)
        if target is not None:
            seen += 1
            if x is None:
                x = target
            elif abs(target - x) > DEAD_ZONE:
                x += (target - x) * SMOOTH
        if "x" in override:
            x = override["x"]
        if x is not None:
            keys.append({"t": round(t, 3), "x": round(min(1 - half, max(half, x)), 4)})
        t += STEP
    if not keys or seen == 0:
        return {"layout": "letterbox"}
    # Fill the head of the span (before anyone was found) with the first known x.
    if keys[0]["t"] > src0:
        keys.insert(0, {"t": round(src0, 3), "x": keys[0]["x"]})
    return {"layout": "single", "keys": keys}


def spans_for(seg: dict, shots: list[dict]) -> list[tuple[float, float, str]]:
    out = []
    for s in shots:
        a, b = max(seg["t0"], s["t0"]), min(seg["t1"], s["t1"])
        if b - a > 1e-3:
            out.append((a, b, s["id"]))
    return out


def plan(an: dict, shorts: dict, pos) -> dict:
    src = an["source"]
    half = window_frac(src["width"], src["height"]) / 2
    result = {"version": 1, "window": round(half * 2, 4), "shorts": []}
    for sh in shorts["shorts"]:
        spans, out_t = [], 0.0
        for si, seg in enumerate(sh["segments"]):
            for a, b, shot in spans_for(seg, an["shots"]):
                p = plan_span(a, b, shot, an["words"], pos, half, sh.get("overrides", {}).get(shot))
                spans.append({"segment": si, "shot": shot, "src0": round(a, 3), "src1": round(b, 3),
                              "out0": round(out_t, 3), **p})
                out_t += b - a
        result["shorts"].append({"id": sh["id"], "spans": spans, "duration": round(out_t, 3)})
    return result


def frame_file(work: Path, truth: Path | None) -> None:
    an = json.loads((work / "analysis.json").read_text())
    shorts = json.loads((work / "shorts.json").read_text())
    pos = TruthPositions(json.loads(truth.read_text())) if truth else FacePositions(an["faces"])
    res = plan(an, shorts, pos)
    res["positions"] = "truth" if truth else "faces"
    (work / "framing.json").write_text(json.dumps(res, indent=1))
    for s in res["shorts"]:
        lay = [sp["layout"][0].upper() for sp in s["spans"]]
        print(f"{s['id']}: {len(s['spans'])} spans  {''.join(lay)}  (S=single, L=letterbox)")


def score(work: Path, truth_path: Path) -> None:
    """How often the face-track window holds the real speaker's head (Blender truth)."""
    an = json.loads((work / "analysis.json").read_text())
    shorts = json.loads((work / "shorts.json").read_text())
    truth = json.loads(truth_path.read_text())
    tp = TruthPositions(truth)
    faces = plan(an, shorts, FacePositions(an["faces"]))
    half = faces["window"] / 2
    hit = miss = lb = 0
    for s in faces["shorts"]:
        for sp in s["spans"]:
            if sp["layout"] != "single":
                lb += 1
                continue
            for k in sp["keys"]:
                who = speaker_at(an["words"], k["t"])
                x, _ = tp.at(k["t"], sp["shot"], who)
                if x is None:
                    continue
                if abs(x - k["x"]) <= half * 0.8:
                    hit += 1
                else:
                    miss += 1
    total = hit + miss
    print(f"face-track framing keeps the speaker in frame {hit}/{total} samples "
          f"({100 * hit / max(1, total):.0f}%); {lb} spans fell back to letterbox")
