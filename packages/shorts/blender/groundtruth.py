"""Where each character's head is on screen, sampled through a Blender film. No rendering.

    blender -b film.blend --python groundtruth.py -- out.json [step_frames]

Writes {fps, frames, shots: [{id, cam, t0, t1}], samples: [{t, shot, chars: {name: [x, y, visible]}}]}.
x and y are 0..1 with y down, the same convention as the face boxes. Shots come from the timeline
markers that bind cameras. A character is a `<Name>_Rig` armature; its head is the first pose bone
with "head" in its name.
"""

import json
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:]
out_path = argv[0]
step = int(argv[1]) if len(argv) > 1 else 6

scene = bpy.context.scene
fps = scene.render.fps / scene.render.fps_base
markers = sorted((m for m in scene.timeline_markers if m.camera), key=lambda m: m.frame)

shots = []
for i, m in enumerate(markers):
    end = markers[i + 1].frame if i + 1 < len(markers) else scene.frame_end + 1
    shots.append({"id": m.name or m.camera.name.removeprefix("Cam_"), "cam": m.camera.name,
                  "f0": m.frame, "f1": end, "t0": round((m.frame - 1) / fps, 3), "t1": round((end - 1) / fps, 3)})

rigs = {}
for ob in bpy.data.objects:
    if ob.type == "ARMATURE" and ob.name.endswith("_Rig"):
        head = next((pb for pb in ob.pose.bones if "head" in pb.name.lower()), None)
        if head:
            rigs[ob.name.removesuffix("_Rig").lower()] = (ob, head.name)


def shot_for(frame):
    cur = None
    for s in shots:
        if s["f0"] <= frame:
            cur = s
    return cur


samples = []
for frame in range(scene.frame_start, scene.frame_end + 1, step):
    scene.frame_set(frame)
    shot = shot_for(frame)
    if not shot:
        continue
    cam = bpy.data.objects[shot["cam"]]
    chars = {}
    for name, (ob, bone) in rigs.items():
        pb = ob.pose.bones[bone]
        p = ob.matrix_world @ ((pb.head + pb.tail) / 2)
        v = world_to_camera_view(scene, cam, p)
        visible = v.z > 0 and 0 <= v.x <= 1 and 0 <= v.y <= 1 and not ob.hide_render
        chars[name] = [round(v.x, 4), round(1 - v.y, 4), bool(visible)]
    samples.append({"t": round((frame - 1) / fps, 3), "shot": shot["id"], "chars": chars})

with open(out_path, "w") as f:
    json.dump({"fps": fps, "frames": scene.frame_end, "shots": [
        {k: s[k] for k in ("id", "cam", "t0", "t1")} for s in shots], "samples": samples}, f)
print(f"GROUNDTRUTH {len(shots)} shots, {len(samples)} samples, chars={sorted(rigs)} -> {out_path}")
