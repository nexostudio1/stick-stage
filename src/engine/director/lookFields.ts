import { z } from "zod";
import { STORY_LOOKS } from "../set/storyPalettes";
import { FINISHES } from "../shots/finishKinds";
import { LETTERINGS } from "../text/fonts";

/** Skit fields for how the whole skit looks (all optional; omitted, it renders in the house look). */
export const lookFields = {
  /** Colour look for every described place: "bright" (storybook, default), "retro" (screen print), "pastel". A place's own `look` wins. */
  look: z.enum(STORY_LOOKS).optional(),
  /** Stage finish: "flat" (default, the house look) or the opt-in "illustrated" (cel shade, ink line, paper grain). */
  finish: z.enum(FINISHES).optional(),
  /** Title, card and figure lettering: "sans" (default, the text font) or "hand" (Kalam). Subtitles keep the text font. */
  lettering: z.enum(LETTERINGS).optional(),
};
