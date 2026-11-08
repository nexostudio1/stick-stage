from shorts.analyse import shots_from_cuts
from shorts.frame import plan, speaker_at
from shorts.props import build
from shorts.select import snap
from shorts.transcript import assign_speakers


def W(text, t0, t1, speaker="S1"):
    return {"text": text, "t0": t0, "t1": t1, "p": 1.0, "speaker": speaker}


def analysis():
    words = [W("Hello", 1.0, 1.4), W("there.", 1.5, 2.0), W("A", 5.0, 5.2), W("secret.", 5.3, 6.0)]
    return {
        "source": {"path": "x.mp4", "width": 1920, "height": 1080, "fps": 24.0, "duration": 10.0},
        "words": words,
        "shots": [{"id": "a", "t0": 0.0, "t1": 4.0}, {"id": "b", "t0": 4.0, "t1": 10.0}],
        "faces": [],
    }


def test_shots_from_cuts_drops_tiny_shots():
    shots = shots_from_cuts([0.2, 3.0, 3.3, 9.8], 10.0)
    assert [(s["t0"], s["t1"]) for s in shots] == [(0.0, 3.0), (3.0, 10.0)]


def test_snap_never_cuts_inside_a_word_and_is_idempotent():
    an = analysis()
    shorts = {"shorts": [{"id": "s1", "title": "t", "segments": [{"role": "main", "t0": 1.2, "t1": 5.5}]}]}
    snap(shorts, an)
    seg = dict(shorts["shorts"][0]["segments"][0])
    assert seg["t0"] <= 1.0 and seg["t1"] >= 6.0
    snap(shorts, an)
    assert shorts["shorts"][0]["segments"][0]["t0"] == seg["t0"]
    assert shorts["shorts"][0]["segments"][0]["t1"] == seg["t1"]


def test_hand_edit_becomes_the_new_pick():
    an = analysis()
    shorts = {"shorts": [{"id": "s1", "title": "t", "segments": [{"role": "main", "t0": 1.2, "t1": 5.5}]}]}
    snap(shorts, an)
    shorts["shorts"][0]["segments"][0]["t0"] = 4.9
    snap(shorts, an)
    assert shorts["shorts"][0]["segments"][0]["pick"][0] == 4.9


def test_speakers_follow_the_script_text_not_the_sidecar_clock():
    words = [W("You", 9.4, 9.6), W("know,", 9.7, 10.0), W("that", 10.2, 10.4), W("bag.", 10.5, 10.9), W("Hmm", 30.0, 30.2)]
    lines = [{"id": "l1", "t0": 5.0, "t1": 10.0, "who": "pim", "text": "I didn't!"},
             {"id": "l2", "t0": 10.0, "t1": 20.0, "who": "bobo", "text": "You know, that bag."}]
    assign_speakers(words, lines)
    assert [w["speaker"] for w in words] == ["bobo"] * 4  # "Hmm" is noise, dropped
    assert speaker_at(words, 9.5) == "bobo"


class _Fixed:
    def at(self, t, shot, who):
        return 0.7, [0.7]


def test_plan_and_props_tile_spans_and_retime_captions():
    an = analysis()
    shorts = {"shorts": [{"id": "s1", "title": "t", "hook": "h", "closing": "c",
                          "segments": [{"role": "teaser", "t0": 5.0, "t1": 6.0}, {"role": "main", "t0": 1.0, "t1": 6.0}]}]}
    framing = plan(an, shorts, _Fixed())
    spans = framing["shorts"][0]["spans"]
    assert [sp["shot"] for sp in spans] == ["b", "a", "b"]
    assert all(sp["layout"] == "single" for sp in spans)
    props = build(an, shorts, framing, "x.mp4")[0]
    at = 0
    for sp in props["spans"]:
        assert sp["from"] == at
        at += sp["frames"]
    assert props["videoFrames"] == at
    assert props["teaserFrames"] == 24
    # The teaser's "A secret." starts at 0 on the short's clock.
    assert props["captions"][0]["startMs"] == 0
