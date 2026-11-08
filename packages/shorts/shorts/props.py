"""shorts.json + framing.json + analysis.json -> one props file per short for the
`ShortFromFootage` Remotion composition (src/app/shorts/). Times become frames at the source fps;
caption words are re-timed onto the short's own timeline.
"""

from __future__ import annotations

import json
from pathlib import Path

END_CARD_S = 3.5
TITLE_S = 2.2


def _captions(words: list[dict], spans: list[dict]) -> list[dict]:
    """Caption lines in StickStage's CaptionLine shape: absolute startMs, line-relative words."""
    lines: list[dict] = []
    for sp in spans:
        shift = sp["out0"] - sp["src0"]
        for w in words:
            if sp["src0"] <= (w["t0"] + w["t1"]) / 2 < sp["src1"]:
                t0 = max(w["t0"], sp["src0"]) + shift
                t1 = min(w["t1"], sp["src1"]) + shift
                key = (w.get("line") or w["speaker"], sp["segment"])
                if not lines or lines[-1]["_key"] != key or t0 * 1000 - lines[-1]["_end"] > 900:
                    lines.append({"_key": key, "_end": 0, "startMs": round(t0 * 1000), "speaker": w["speaker"], "words": []})
                ln = lines[-1]
                ln["words"].append({"text": w["text"], "startMs": round(t0 * 1000) - ln["startMs"],
                                    "endMs": round(t1 * 1000) - ln["startMs"]})
                ln["_end"] = t1 * 1000
    for ln in lines:
        del ln["_key"], ln["_end"]
    return lines


def build(an: dict, shorts: dict, framing: dict, src_url: str) -> list[dict]:
    fps = an["source"]["fps"]
    f = lambda s: round(s * fps)  # noqa: E731
    by_id = {s["id"]: s for s in framing["shorts"]}
    out = []
    for sh in shorts["shorts"]:
        fr = by_id[sh["id"]]
        spans = []
        for sp in fr["spans"]:
            item = {"from": f(sp["out0"]), "frames": max(1, f(sp["src1"] - sp["src0"])),
                    "srcFrom": f(sp["src0"]), "layout": sp["layout"], "segment": sp["segment"]}
            if sp["layout"] == "single":
                item["keys"] = [{"f": f(k["t"] - sp["src0"]), "x": k["x"]} for k in sp["keys"]]
            spans.append(item)
        # Re-pack so spans tile exactly (rounding can leave a 1-frame gap or overlap).
        at = 0
        for item in spans:
            item["from"] = at
            at += item["frames"]
        teaser_end = sum(it["frames"] for it in spans if sh["segments"][it["segment"]]["role"] == "teaser")
        out.append({
            "id": sh["id"],
            "src": src_url,
            "fps": fps,
            "srcWidth": an["source"]["width"],
            "srcHeight": an["source"]["height"],
            "window": framing["window"],
            "videoFrames": at,
            "durationInFrames": at + f(END_CARD_S),
            "teaserFrames": teaser_end,
            "titleFrames": f(TITLE_S),
            "spans": spans,
            "captions": _captions(an["words"], fr["spans"]),
            "title": sh["title"],
            "hook": sh.get("hook", ""),
            "closing": sh.get("closing", ""),
            "brand": shorts.get("brand", {}),
        })
    return out


def write_props(work: Path, src_url: str) -> None:
    an = json.loads((work / "analysis.json").read_text())
    shorts = json.loads((work / "shorts.json").read_text())
    framing = json.loads((work / "framing.json").read_text())
    for p in build(an, shorts, framing, src_url):
        path = work / f"props-{p['id']}.json"
        path.write_text(json.dumps(p))
        print(f"{path}  {p['durationInFrames'] / p['fps']:.1f}s")
