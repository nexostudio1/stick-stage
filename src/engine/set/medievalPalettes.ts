import type { Palette } from "./palettes";

/** Medieval channel grounds: muted, dark enough to feel serious, light rim so strokes still read. */
export const MEDIEVAL_PALETTES: Record<string, Palette> = {
  /** A fen at dusk under a heavy sky: slate water, brown mud, olive reeds. */
  "fen-dusk": {
    wallA: "#4B5A63",
    wallB: "#2E3B44",
    floor: "#5A4632",
    accent: "#D9A441",
    shade: "#1F2A31",
    sky: "#7E929B",
    detail: "#5E6B3A",
    glow: "#F2D8A0",
    rim: "#F3E9D2",
  },
  /** A stone hall by torchlight. */
  "castle-torch": {
    wallA: "#3A3A44",
    wallB: "#2A2A33",
    floor: "#45403A",
    accent: "#E8A33D",
    shade: "#1C1C22",
    sky: "#5A6378",
    detail: "#7A2430",
    glow: "#FFC56B",
    rim: "#F3E9D2",
  },
  /** A country road late in the day. */
  "road-evening": {
    wallA: "#7A4F37",
    wallB: "#5A3A2C",
    floor: "#5E4A36",
    accent: "#E8B04A",
    shade: "#2E2730",
    sky: "#A8664A",
    detail: "#4F5E35",
    glow: "#FFE0A3",
    rim: "#F3E9D2",
  },
};
