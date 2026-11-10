import type { Palette } from "./palettes";

/**
 * The relatable four-person channel (`four` kit): bright, saturated places, unlike the soft room
 * palettes. Only `four-*` sets use these, so no other channel changes.
 *
 * Rules:
 * - big blocks of strong colour (seats, panels, the view outside); the wall behind the heads stays
 *   light, so white heads, bright tops and the near-black outlines all read;
 * - the cast's tops (red, green, mustard, violet) never match the colour directly behind them;
 * - the view outside gets lighter and bluer with distance (`scenery` far → near).
 */
export const FOUR_PALETTES: Record<string, Palette> = {
  /** Commuter train on a sunny morning: cream walls, cobalt seats, coral straps, green country outside. */
  "four-train": {
    wallA: "#fff3d6",
    wallB: "#2ec4b6",
    floor: "#8a93b8",
    accent: "#ff5a5f",
    shade: "#6d7fae",
    sky: "#5ec8f2",
    detail: "#2d5bd3",
    glow: "#ffe066",
    scenery: { far: "#a7dcc9", mid: "#4cbf6b", near: "#23935a", ground: "#e9c46a" },
  },
};
