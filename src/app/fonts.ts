import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT_STACK, SYMBOL_FALLBACKS, withSymbolFallbacks } from "../engine/text/fonts";

/** Montserrat (OFL, `public/fonts/`), bundled locally so renders never fetch fonts. */
const TEXT_FAMILY = "StickStage Sans";
/** The text font, then Greek and maths fallbacks: a `font-family` value. */
export const TEXT_FONT = withSymbolFallbacks(TEXT_FAMILY);

const load = (family: string, file: string, weight?: string) =>
  loadFont({ family, url: staticFile(file), ...(weight ? { weight } : {}) }).catch((err) => {
    throw new Error(`Could not load ${family} (${file}): ${String(err)}`);
  });

load(TEXT_FAMILY, "fonts/Montserrat-Variable.ttf", "100 900");
for (const font of SYMBOL_FALLBACKS) load(font.family, font.file, font.weight);
for (const font of FONT_STACK) load(font.family, font.file);

// The Catch's night-shift fonts (OFL, `public/fonts/`), named by `CATCH_FONTS`.
load("Catch Display", "fonts/BricolageGrotesque-Variable.ttf", "200 800");
load("Catch Numbers", "fonts/BigShouldersDisplay-Variable.ttf", "100 900");
load("Catch Mono", "fonts/IBMPlexMono-SemiBold.ttf", "600");
