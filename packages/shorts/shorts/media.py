"""ffmpeg/ffprobe helpers. Everything shells out; nothing decodes video in Python except faces."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


def probe(src: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(src)],
        check=True, capture_output=True, text=True,
    ).stdout
    data = json.loads(out)
    video = next(s for s in data["streams"] if s["codec_type"] == "video")
    num, den = (int(x) for x in video["r_frame_rate"].split("/"))
    return {
        "path": str(src),
        "width": int(video["width"]),
        "height": int(video["height"]),
        "fps": num / den,
        "duration": float(data["format"]["duration"]),
        "hasAudio": any(s["codec_type"] == "audio" for s in data["streams"]),
    }


def extract_audio(src: Path, dst: Path) -> Path:
    """Mono 16 kHz wav, what whisper wants."""
    if not dst.exists():
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(dst)],
            check=True,
        )
    return dst


def make_proxy(src: Path, dst: Path, fps: float, width: int = 640) -> Path:
    """Small, low-fps copy for face detection."""
    if not dst.exists():
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-an", "-vf", f"fps={fps},scale={width}:-2",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", str(dst)],
            check=True,
        )
    return dst


def scene_cuts(src: Path, threshold: float = 0.3) -> list[float]:
    """Times (s) where ffmpeg's scene score jumps above threshold."""
    proc = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(src), "-an", "-vf",
         f"scale=320:-2,select='gt(scene,{threshold})',showinfo", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    return [float(m) for m in re.findall(r"pts_time:([0-9.]+)", proc.stderr)]
