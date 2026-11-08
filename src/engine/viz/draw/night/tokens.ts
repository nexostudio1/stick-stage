/**
 * The night-shift look (The Catch, `../planning/2026-10-30-the-catch/plan.md` §4): six colour
 * tokens and three OFL fonts (`public/fonts`, loaded by `src/app/fonts.ts`). One Sodium hero and
 * at most one Ember element per frame; Neon is for data lines only.
 */
export const NIGHT = {
  night: "#0E1A24",
  teal: "#1F4650",
  paper: "#F3E9D2",
  sodium: "#FFB547",
  ember: "#FF5A36",
  neon: "#5FE3D0",
  ink: "#0B1216",
  /** Raccoon fur, mask and muzzle (Nickel). */
  fur: "#8F99A5",
  furDark: "#6B7581",
  mask: "#14161B",
  cream: "#F1EADD",
  emberDark: "#C83E22",
  steel: "#262A31",
  tileTop: "#26303A",
  tileBottom: "#11161C",
} as const;

export const CATCH_FONTS = {
  /** Bricolage Grotesque 800: the voice, key phrases, headlines. */
  display: "Catch Display",
  /** Big Shoulders Display 900: numbers, flap boards. */
  numbers: "Catch Numbers",
  /** IBM Plex Mono 600: labels, sources, case-file text. */
  mono: "Catch Mono",
} as const;

/** `#rrggbb` + alpha. */
export const alpha = (hex: string, a: number): string =>
  `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0")}`;

/** The ink outline every night-world drawing shares (Nickel's sheet: 5 px at 1080). */
export const outline = (k: number) => ({ stroke: NIGHT.ink, strokeWidth: 5 * k, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
