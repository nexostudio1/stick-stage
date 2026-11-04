"""Picking shorts is editorial: an LLM (Claude, or a Tamtree Chat step) or a person writes
shorts.json from the transcript. This module prints the transcript for them and checks and snaps
what they wrote.

shorts.json:
  {"version": 1, "shorts": [{
     "id": "s1", "title": "...", "hook": "on-screen hook text", "closing": "moral, fact or CTA",
     "why": "two sentences for the reviewer",
     "segments": [{"role": "teaser", "t0": 0, "t1": 0}, {"role": "main", "t0": 0, "t1": 0}],
     "overrides": {"<shotId>": {"layout": "single|letterbox", "x": 0.5, "target": "<speaker>"}}
  }]}
"""

from __future__ import annotations

import json
from pathlib import Path

PAD_IN = 0.10
PAD_OUT = 0.15
SNAP_TO_CUT = 0.45
SLIVER_WORD = 0.2      # an end may clip this much off the last word's tail to land on a cut
TARGET = (20.0, 60.0)


def print_transcript(an: dict) -> None:
    cuts = iter(an["shots"])
    shot = next(cuts, None)
    line, cur = [], None
    for w in an["words"]:
        while shot and w["t0"] >= shot["t1"]:
            shot = next(cuts, None)
            if line:
                print(f"{line[0][0]:7.2f}  {cur:>6}  {' '.join(t for _, t in line)}")
                line = []
            if shot:
                print(f"{shot['t0']:7.2f}  ---- shot {shot['id']} ----")
        if cur != w["speaker"] and line:
            print(f"{line[0][0]:7.2f}  {cur:>6}  {' '.join(t for _, t in line)}")
            line = []
        cur = w["speaker"]
        line.append((w["t0"], w["text"]))
    if line:
        print(f"{line[0][0]:7.2f}  {cur:>6}  {' '.join(t for _, t in line)}")


def _snap_in(t: float, words: list[dict], cuts: list[float]) -> float:
    inside = next((w for w in words if w["t0"] < t < w["t1"]), None)
    if inside:
        t = inside["t0"]
    t = max(0.0, t - PAD_IN) if not inside else max(0.0, t - PAD_IN)
    near = [c for c in cuts if 0 <= c - t <= SNAP_TO_CUT or 0 <= t - c <= SNAP_TO_CUT]
    if near:
        c = min(near, key=lambda c: abs(c - t))
        # Never let the cut snap swallow the first word.
        first = next((w for w in words if w["t1"] > t), None)
        if not first or c <= first["t0"]:
            t = c
    return round(t, 3)


def _snap_out(t: float, words: list[dict], cuts: list[float], duration: float) -> float:
    inside = next((w for w in words if w["t0"] < t < w["t1"]), None)
    if inside:
        t = inside["t1"]
    t = min(duration, t + PAD_OUT)
    near = [c for c in cuts if abs(c - t) <= SNAP_TO_CUT]
    if near:
        c = min(near, key=lambda c: abs(c - t))
        last = next((w for w in reversed(words) if w["t0"] < t), None)
        # End on the cut, not a flash of the next shot, unless that would clip the last word badly.
        if not last or c >= last["t1"] - SLIVER_WORD:
            t = c
    return round(t, 3)


def snap(shorts: dict, an: dict) -> list[str]:
    words, duration = an["words"], an["source"]["duration"]
    cuts = sorted({s["t0"] for s in an["shots"]} | {s["t1"] for s in an["shots"]})
    notes = []
    for sh in shorts["shorts"]:
        total = 0.0
        for seg in sh["segments"]:
            # Snap from the editor's pick, never from a previous snap, so re-running is a no-op.
            # Editing t0/t1 by hand makes them the new pick.
            pick = seg.get("pick")
            if not pick or (seg.get("snapped") and [seg["t0"], seg["t1"]] != seg["snapped"]):
                pick = seg["pick"] = [seg["t0"], seg["t1"]]
            seg["t0"] = _snap_in(pick[0], words, cuts)
            seg["t1"] = _snap_out(pick[1], words, cuts, duration)
            seg["snapped"] = [seg["t0"], seg["t1"]]
            if seg["t1"] <= seg["t0"]:
                notes.append(f"{sh['id']}: a {seg['role']} segment is empty after snapping")
            total += seg["t1"] - seg["t0"]
            heard = [w for w in words if seg["t0"] <= w["t0"] and w["t1"] <= seg["t1"]]
            seg["words"] = len(heard)
            if seg["role"] == "main" and heard and heard[0].get("line"):
                lid = heard[0]["line"]
                if any(w.get("line") == lid and w["t0"] < seg["t0"] for w in words):
                    notes.append(f"{sh['id']}: main starts mid-line ({lid})")
        sh["duration"] = round(total, 2)
        if not TARGET[0] <= total <= TARGET[1]:
            notes.append(f"{sh['id']}: {total:.1f} s is outside {TARGET[0]:.0f}-{TARGET[1]:.0f} s")
        roles = [s["role"] for s in sh["segments"]]
        if "main" not in roles:
            notes.append(f"{sh['id']}: no main segment")
    return notes


def snap_file(work: Path) -> None:
    an = json.loads((work / "analysis.json").read_text())
    path = work / "shorts.json"
    shorts = json.loads(path.read_text())
    notes = snap(shorts, an)
    path.write_text(json.dumps(shorts, indent=2))
    for sh in shorts["shorts"]:
        segs = ", ".join(f"{s['role']} {s['t0']:.2f}-{s['t1']:.2f}" for s in sh["segments"])
        print(f"{sh['id']}  {sh['duration']:5.1f}s  {segs}  {sh['title']}")
    for n in notes:
        print("  ! " + n)
