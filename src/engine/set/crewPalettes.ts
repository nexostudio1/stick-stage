import type { Palette } from "./palettes";

/**
 * The relatable three-person channel (`crew` kit): bright, saturated places, unlike the soft room
 * palettes. Only `crew-*` sets use these, so no other channel changes.
 *
 * Rules:
 * - big blocks of strong colour (seats, panels, the view outside); the wall behind the heads stays
 *   light, so white heads, bright tops and the near-black outlines all read;
 * - the cast's tops (red, green, mustard, violet) never match the colour directly behind them;
 * - the view outside gets lighter and bluer with distance (`scenery` far → near).
 */
export const CREW_PALETTES: Record<string, Palette> = {
  /** Commuter train on a sunny morning: cream walls, cobalt seats, coral straps, green country outside. */
  "crew-train": {
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
  /** Office meeting room: warm white walls, a cobalt feature panel, coral pendants, teal chairs, sky through the glass. */
  "crew-office": {
    wallA: "#fdf7ee",
    wallB: "#3d6bea",
    floor: "#9aa3c7",
    accent: "#ff7a45",
    shade: "#6b7aa8",
    sky: "#8fd3f4",
    detail: "#14a3a3",
    glow: "#ffe27a",
  },
  /** Backyard BBQ on a summer afternoon: deep blue sky, a warm timber fence, red grill and umbrella, green lawn. */
  "crew-bbq": {
    wallA: "#fff1d8",
    wallB: "#e0a060",
    floor: "#7cc35a",
    accent: "#e63b2e",
    shade: "#6c6f8f",
    sky: "#4fb4f0",
    detail: "#2a7de1",
    glow: "#ffd23f",
    scenery: { far: "#9fd8b4", mid: "#43b05c", near: "#22884a", ground: "#7cc35a" },
  },
};
