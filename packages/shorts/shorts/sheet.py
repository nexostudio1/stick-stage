"""Contact sheet per short: a frame from the middle of every span, the 9:16 window drawn on it."""

from __future__ import annotations

import json
from pathlib import Path

TILE_W = 480


def sheets(work: Path) -> None:
    import cv2
    import numpy as np

    an = json.loads((work / "analysis.json").read_text())
    framing = json.loads((work / "framing.json").read_text())
    src = an["source"]
    cap = cv2.VideoCapture(src["path"])
    win = framing["window"]
    tile_h = round(TILE_W * src["height"] / src["width"])
    for sh in framing["shorts"]:
        tiles = []
        for sp in sh["spans"]:
            mid = (sp["src0"] + sp["src1"]) / 2
            cap.set(cv2.CAP_PROP_POS_MSEC, mid * 1000)
            ok, img = cap.read()
            if not ok:
                continue
            img = cv2.resize(img, (TILE_W, tile_h))
            if sp["layout"] == "single":
                k = min(sp["keys"], key=lambda k: abs(k["t"] - mid))
                x0 = round((k["x"] - win / 2) * TILE_W)
                x1 = round((k["x"] + win / 2) * TILE_W)
                dim = img.copy()
                dim[:] = (dim * 0.35).astype(np.uint8)
                dim[:, x0:x1] = img[:, x0:x1]
                img = dim
                cv2.rectangle(img, (x0, 0), (x1 - 1, tile_h - 1), (0, 220, 255), 2)
            else:
                cv2.rectangle(img, (0, 0), (TILE_W - 1, tile_h - 1), (255, 120, 0), 3)
            label = f"{sp['shot']} {sp['src0']:.1f}s {sp['layout']}"
            cv2.putText(img, label, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 4)
            cv2.putText(img, label, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            tiles.append(img)
        if not tiles:
            continue
        cols = 4
        while len(tiles) % cols:
            tiles.append(np.zeros_like(tiles[0]))
        rows = [np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]
        out = work / f"sheet-{sh['id']}.jpg"
        cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82])
        print(out)
    cap.release()
