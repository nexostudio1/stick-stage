import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Stage } from "../src/engine";
import { PART_INFO } from "../src/engine/set/parts/registry";
import { SCIENCE_VARIANTS } from "../src/engine/set/parts/scienceThemes";
import { sets } from "../src/data";

const html = (set: string, frame: number) =>
  renderToStaticMarkup(React.createElement(Stage, { set: sets[set]!, actors: [], width: 1080, height: 1920, frame }));

describe("themed science sets", () => {
  it("ships one set per variant, on its own palette, drawn by science-wash", () => {
    expect(PART_INFO["science-wash"]?.backdrop).toBe(true);
    for (const v of SCIENCE_VARIANTS) {
      const set = sets[`science-${v}`];
      expect(set, v).toBeDefined();
      expect(set!.palette).toBe(`science-${v}`);
      expect(set!.layers[0]).toMatchObject({ part: "science-wash", variant: v });
    }
  });

  it("is frame-pure: the same frame draws the same markup, a later frame moves", () => {
    for (const v of SCIENCE_VARIANTS) {
      const a = html(`science-${v}`, 90);
      expect(html(`science-${v}`, 90), v).toBe(a);
      expect(html(`science-${v}`, 240), v).not.toBe(a);
    }
  });

  it("masks the shapes down in the card band and rims the cast only on the dark cosmos ground", () => {
    expect(html("science-dawn", 0)).toContain("-sci-mask");
    expect(html("science-cosmos", 0)).toContain("feMorphology");
    expect(html("science-dawn", 0)).not.toContain("feMorphology");
  });

  it("falls back to dawn for an unknown variant", () => {
    const set = { ...sets["science-tide"]!, id: "x", layers: [{ ...sets["science-tide"]!.layers[0]!, variant: "nope" }] };
    const svg = renderToStaticMarkup(React.createElement(Stage, { set, actors: [], width: 1080, height: 1920, frame: 0 }));
    expect(svg).toContain("<ellipse");
  });
});
