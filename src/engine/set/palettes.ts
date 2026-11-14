import { darken, lighten, mix } from "../lib/color";
import { STORY_PALETTES } from "./storyPalettes";
import { CREW_PALETTES } from "./crewPalettes";
import { MEDIEVAL_PALETTES } from "./medievalPalettes";

export type Palette = {
  wallA: string;
  wallB: string;
  floor: string;
  accent: string;
  shade: string;
  sky: string;
  detail: string;
  /**
   * A light rim drawn around every cast member (an SVG filter on the cast layer). Set only on
   * truly dark grounds, where the near-black outlines would vanish.
   */
  rim?: string;
  /** Sun, moon and stars (story kit); missing means a light accent. */
  glow?: string;
  /** The place's light: a soft-light grade on the cast so it sits in the scene (story kit). */
  light?: string;
  /** The view outside a vehicle window, far → near (the `crew` kit's train). Other kits ignore it. */
  scenery?: { far: string; mid: string; near: string; ground: string };
};

/**
 * Set palettes are soft and low-contrast so the near-black character strokes always win.
 * Set parts use only these tokens (or darken/lighten of them), never raw hex.
 */
export const PALETTES: Record<string, Palette> = {
  lilac: {
    wallA: "#ddd4f0",
    wallB: "#cfc3e9",
    floor: "#b3a2d3",
    accent: "#f3bccb",
    shade: "#c2b3e0",
    sky: "#c4e4f4",
    detail: "#9a88c2",
  },
  mint: {
    wallA: "#d5eee3",
    wallB: "#c4e5d6",
    floor: "#9cc8b3",
    accent: "#f6c894",
    shade: "#b5dac8",
    sky: "#cfe9f6",
    detail: "#76a893",
  },
  peach: {
    wallA: "#f8e0d0",
    wallB: "#f1cfbb",
    floor: "#dcab93",
    accent: "#9cc8dd",
    shade: "#ecc4ae",
    sky: "#d2e9f5",
    detail: "#bf8b74",
  },
  /** Outdoor: green grass and foliage, blue sky. */
  meadow: {
    wallA: "#dcecd9",
    wallB: "#c8e2c3",
    floor: "#afd6a2",
    accent: "#f4c98a",
    shade: "#bcdcb2",
    sky: "#cde6f5",
    detail: "#8fbf84",
  },
  /** Warm evening outdoors. */
  dusk: {
    wallA: "#eed9e4",
    wallB: "#e2c6d6",
    floor: "#cfb2c4",
    accent: "#f6c49a",
    shade: "#dcbccd",
    sky: "#f7d9d0",
    detail: "#a98fb4",
  },
  /** Warm outdoors: olive grass, orange foliage. */
  autumn: {
    wallA: "#f1e4d2",
    wallB: "#e6d3b8",
    floor: "#c8cf9f",
    accent: "#eaa982",
    shade: "#dccbaa",
    sky: "#f5e0cb",
    detail: "#e2ab7a",
  },
  /** Cool street greys. */
  city: {
    wallA: "#dde2ea",
    wallB: "#cbd2de",
    floor: "#bfc6d2",
    accent: "#f2bf94",
    shade: "#c3cad7",
    sky: "#d2e6f3",
    detail: "#95a1b6",
  },
  /** Sunny kitchen yellows. */
  butter: {
    wallA: "#f7ecc9",
    wallB: "#efdfae",
    floor: "#d7c08e",
    accent: "#9fcbd9",
    shade: "#eadaa8",
    sky: "#d3eaf6",
    detail: "#c4a468",
  },
  /** Night outdoors: blue-grey sky, still light enough for the character strokes. */
  night: {
    wallA: "#cfd3e8",
    wallB: "#b9bfdc",
    floor: "#a8b0cc",
    accent: "#f3d99a",
    shade: "#bcc2dc",
    sky: "#9fa9d0",
    detail: "#7f89b3",
  },
  /** Beach: sand floor, sea-blue detail. */
  coast: {
    wallA: "#e4f1f4",
    wallB: "#cfe6ec",
    floor: "#f0dcb0",
    accent: "#f4a99a",
    shade: "#e6d3a8",
    sky: "#c8e8f6",
    detail: "#7fbccc",
  },
  /** Comedy-club stage: soft red curtain, warm light. */
  stage: {
    wallA: "#e7bfc3",
    wallB: "#d9a9af",
    floor: "#caa98a",
    accent: "#f2d08f",
    shade: "#d7b3b6",
    sky: "#d6e6f3",
    detail: "#a9828a",
  },
  /**
   * Science grounds. Mid-tone on purpose: dark outlines keep ≥ 3:1 against every tone, and
   * figures switch to chalk (light ink) over them.
   */
  "deep-space": {
    wallA: "#5d6aa8",
    wallB: "#5864a3",
    floor: "#6470aa",
    accent: "#f3d99a",
    shade: "#5f6ba8",
    sky: "#5d6aa8",
    detail: "#8e9ad2",
  },
  /**
   * Nebula night: deep indigo bands (wallA → wallB), magenta / teal / violet glows (sky, detail,
   * shade), a lavender moon floor. Dark, so the cast gets a light rim.
   */
  nebula: {
    wallA: "#141638",
    wallB: "#2e2a6a",
    floor: "#6b5aa8",
    accent: "#f6c445",
    shade: "#7b5cff",
    sky: "#c0479a",
    detail: "#2bb3b1",
    rim: "#cfd6ff",
  },
  /** The neutral void: slate teal, a faint grid floor. */
  void: {
    wallA: "#4f7a8a",
    wallB: "#4b7484",
    floor: "#55808f",
    accent: "#f2cf8a",
    shade: "#527c8c",
    sky: "#4f7a8a",
    detail: "#86aeba",
  },
  blueprint: {
    wallA: "#3f6f9e",
    wallB: "#3d6c9a",
    floor: "#4878a8",
    accent: "#f6d36b",
    shade: "#4373a3",
    sky: "#3f6f9e",
    detail: "#a9c9ea",
  },
  /** A deeper indigo blueprint: alternates with `blueprint` across a long explainer's chapters. */
  indigo: {
    wallA: "#34508a",
    wallB: "#324d86",
    floor: "#3d5b97",
    accent: "#f6d36b",
    shade: "#38548f",
    sky: "#34508a",
    detail: "#a8bdf0",
    rim: "#e3e9ff",
  },
  /** Explainer grounds: warm paper (ink figures) and a deep ink night (chalk figures). */
  paper: {
    wallA: "#f6f1e6",
    wallB: "#efe7d6",
    floor: "#e4d9c2",
    accent: "#e8590c",
    shade: "#ebe2cf",
    sky: "#f6f1e6",
    detail: "#c9bb9c",
  },
  ink: {
    wallA: "#14213a",
    wallB: "#1d2d4d",
    floor: "#22355a",
    accent: "#ffd84a",
    shade: "#1a2944",
    sky: "#14213a",
    detail: "#3d5580",
    rim: "#cfd6ff",
  },
  /** The Catch's night shift: Night ground, Teal surfaces, Sodium light (plan §4). */
  "night-shift": {
    wallA: "#0E1A24",
    wallB: "#16303A",
    floor: "#122630",
    accent: "#FFB547",
    shade: "#0A141B",
    sky: "#1F4650",
    detail: "#2A4A55",
    glow: "#FFC56B",
    rim: "#F3E9D2",
  },
  /** The Catch's first daylight (a callback): warm paper walls, teal wood, morning sun. */
  morning: {
    wallA: "#F3E9D2",
    wallB: "#E4D3B0",
    floor: "#B98E5E",
    accent: "#FFB547",
    shade: "#D9C49C",
    sky: "#BFE3E8",
    detail: "#1F4650",
    glow: "#FFF1C9",
  },
  /**
   * Themed science grounds (`science-wash`, the shorts' cutaway): mid-tone so the near-black
   * strokes and the white-boxed subtitles both read. Dawn: amber to coral, for time and the Earth.
   */
  "science-dawn": {
    wallA: "#efae7c",
    wallB: "#e0846a",
    floor: "#c9735e",
    accent: "#ffe1a6",
    shade: "#e99b78",
    sky: "#f5c992",
    detail: "#fff1dc",
  },
  /** Tide: sea teal, for the oceans, the Moon and waves. */
  "science-tide": {
    wallA: "#4d9a9e",
    wallB: "#3a8089",
    floor: "#3b7d84",
    accent: "#ffd98a",
    shade: "#42888f",
    sky: "#6fbcb8",
    detail: "#c6f1ec",
  },
  /** Cosmos: magenta to indigo, for space. Dark, so the cast gets a light rim. */
  "science-cosmos": {
    wallA: "#3a2c7a",
    wallB: "#5b2f84",
    floor: "#4b3b8e",
    accent: "#ffc857",
    shade: "#7c3fa3",
    sky: "#c2549f",
    detail: "#a7dcff",
    rim: "#e6dcff",
  },
  /** Lab: fresh lime, for chemistry and life. */
  "science-lab": {
    wallA: "#bcd97f",
    wallB: "#a1c768",
    floor: "#8aae58",
    accent: "#fff1a8",
    shade: "#accd72",
    sky: "#d8ed9f",
    detail: "#f6ffe0",
  },
  /** A bright, clean lab. */
  "lab-white": {
    wallA: "#e6eef0",
    wallB: "#d8e4e8",
    floor: "#b9c9cf",
    accent: "#f4b183",
    shade: "#cfdde2",
    sky: "#d6ecf5",
    detail: "#7fa6b3",
  },
};

/** Story kit palettes (the shape tier) in their three looks: see `storyPalettes.ts`. */
Object.assign(PALETTES, STORY_PALETTES);
/** The relatable three-person channel (`crew` kit): saturated, high-contrast places. */
Object.assign(PALETTES, CREW_PALETTES);
Object.assign(PALETTES, MEDIEVAL_PALETTES);

/** Tones every part may use, derived from the seven tokens (still no raw hex in parts). */
export const derived = (p: Palette) => ({
  wood: darken(mix(p.accent, p.detail, 0.45), 0.1),
  metal: darken(mix(p.detail, p.wallB, 0.45), 0.08),
  glass: lighten(p.sky, 0.3),
  paper: lighten(p.wallA, 0.72),
  foliage: p.detail,
});

export const getPalette = (id: string): Palette => {
  const p = PALETTES[id];
  if (!p) throw new Error(`Unknown palette "${id}". Known: ${Object.keys(PALETTES).join(", ")}`);
  return p;
};
