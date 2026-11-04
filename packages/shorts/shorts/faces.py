"""Face boxes on a low-fps proxy, linked into tracks within each shot.

Boxes are normalised to the source frame (0..1), so they don't care about the proxy's size.
"""

from __future__ import annotations

from pathlib import Path

MODEL = Path(__file__).resolve().parent.parent / "models" / "blaze_face_short_range.tflite"


def detect(proxy: Path, fps: float, min_conf: float = 0.5) -> list[dict]:
    """[{t, boxes: [[x, y, w, h, score], ...]}] for every proxy frame."""
    import cv2
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions, vision

    det = vision.FaceDetector.create_from_options(
        vision.FaceDetectorOptions(base_options=BaseOptions(model_asset_path=str(MODEL)),
                                   min_detection_confidence=min_conf))
    cap = cv2.VideoCapture(str(proxy))
    frames, i = [], 0
    while True:
        ok, bgr = cap.read()
        if not ok:
            break
        h, w = bgr.shape[:2]
        img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        boxes = []
        for d in det.detect(img).detections:
            b = d.bounding_box
            boxes.append([round(b.origin_x / w, 4), round(b.origin_y / h, 4), round(b.width / w, 4),
                          round(b.height / h, 4), round(d.categories[0].score, 3)])
        frames.append({"t": round(i / fps, 3), "boxes": boxes})
        i += 1
    cap.release()
    return frames


def _iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a[0], a[1], a[0] + a[2], a[1] + a[3]
    bx1, by1, bx2, by2 = b[0], b[1], b[0] + b[2], b[1] + b[3]
    iw, ih = max(0, min(ax2, bx2) - max(ax1, bx1)), max(0, min(ay2, by2) - max(ay1, by1))
    inter = iw * ih
    return inter / (a[2] * a[3] + b[2] * b[3] - inter + 1e-9)


def track(frames: list[dict], shots: list[dict], max_gap: float = 1.0) -> list[dict]:
    """Greedy IoU linking, restarted at every shot cut. Tracks shorter than 3 hits are dropped."""
    tracks: list[dict] = []
    for shot in shots:
        live: list[dict] = []
        for fr in (f for f in frames if shot["t0"] <= f["t"] < shot["t1"]):
            for box in fr["boxes"]:
                best = max(live, key=lambda tr: _iou(tr["points"][-1]["box"], box), default=None)
                if best and _iou(best["points"][-1]["box"], box) > 0.2 and fr["t"] - best["points"][-1]["t"] <= max_gap:
                    best["points"].append({"t": fr["t"], "box": box[:4]})
                else:
                    tr = {"id": f"f{len(tracks) + len(live) + 1}", "shot": shot["id"],
                          "points": [{"t": fr["t"], "box": box[:4]}]}
                    live.append(tr)
        tracks.extend(tr for tr in live if len(tr["points"]) >= 3)
    return tracks
