"""shorts <command> — see packages/shorts/README.md."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser(prog="shorts")
    sub = ap.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("analyse", help="video -> work/analysis.json")
    a.add_argument("src", type=Path)
    a.add_argument("--work", type=Path, required=True)
    a.add_argument("--sidecar", type=Path, help="SRT (NAME: prefixes) or TSV (id start who text) for speakers")
    a.add_argument("--shots", type=Path, help="shot table JSON {shots:[{id,t0,t1}]} (e.g. Blender groundtruth.json)")
    a.add_argument("--language")
    a.add_argument("--no-faces", action="store_true")

    t = sub.add_parser("transcript", help="print the transcript with times and shot cuts, for picking shorts")
    t.add_argument("--work", type=Path, required=True)

    s = sub.add_parser("snap", help="check shorts.json and snap segment edges to words and shots")
    s.add_argument("--work", type=Path, required=True)

    f = sub.add_parser("frame", help="analysis + shorts -> framing.json (9:16 crop paths)")
    f.add_argument("--work", type=Path, required=True)
    f.add_argument("--truth", type=Path, help="groundtruth.json: use it for positions instead of face tracks")

    sc = sub.add_parser("score", help="score face tracks against Blender ground truth")
    sc.add_argument("--work", type=Path, required=True)
    sc.add_argument("--truth", type=Path, required=True)

    sh = sub.add_parser("sheet", help="contact sheet per short with the crop window drawn")
    sh.add_argument("--work", type=Path, required=True)

    p = sub.add_parser("props", help="write render props for each short (for the ShortFromFootage composition)")
    p.add_argument("--work", type=Path, required=True)
    p.add_argument("--src-url", required=True, help="where the composition loads the source video from")

    args = ap.parse_args()
    if args.cmd == "analyse":
        from .analyse import analyse
        res = analyse(args.src, args.work, args.sidecar, args.shots, args.language, not args.no_faces)
        print(f"{len(res['words'])} words, {len(res['shots'])} shots ({res['shotsSource']}), "
              f"{len(res['faces'])} face tracks -> {args.work / 'analysis.json'}")
        bad = [d for d in res.get("drift", []) if d["drift"] is None or abs(d["drift"]) > 0.5]
        if bad:
            print(f"sidecar drift > 0.5 s or unheard on {len(bad)} lines: " + ", ".join(
                f"{d['line']}({d['drift']})" for d in bad))
    elif args.cmd == "transcript":
        from .select import print_transcript
        print_transcript(json.loads((args.work / "analysis.json").read_text()))
    elif args.cmd == "snap":
        from .select import snap_file
        snap_file(args.work)
    elif args.cmd == "frame":
        from .frame import frame_file
        frame_file(args.work, args.truth)
    elif args.cmd == "score":
        from .frame import score
        score(args.work, args.truth)
    elif args.cmd == "sheet":
        from .sheet import sheets
        sheets(args.work)
    elif args.cmd == "props":
        from .props import write_props
        write_props(args.work, args.src_url)


if __name__ == "__main__":
    main()
