/** Params for the time-and-rotation kinds: `globe`, `clock`, `growth`, `earthmoon`. */
import { z } from "zod";
import { color, text } from "./paramsBase";

const lonLat = z.strictObject({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  label: text.optional(),
});

export const GlobeParams = z.strictObject({
  /** Longitude at the centre of the view (tween it to turn the Earth). */
  lon: z.number().min(-1440).max(1440).default(0),
  /** Degrees per second of continuous spin, added to `lon` (eastward, like the real Earth). */
  spin: z.number().min(-360).max(360).default(0),
  /** Latitude the view looks from (tilt toward the north pole). */
  lat: z.number().min(-60).max(60).default(18),
  /** 0…1: the night half darkens (light comes from `light`, a screen angle in degrees, 0 = from the right). */
  night: z.number().min(0).max(1).default(0.6),
  light: z.number().min(-360).max(360).default(200),
  /** 0…1: polar ice caps (1 = big caps reaching about 25° from each pole). */
  ice: z.number().min(0).max(1).default(0),
  /** 0…1: meltwater dots run from the poles toward the equator (the skater's arms going out). */
  melt: z.number().min(0).max(1).default(0),
  /** 0…1: the tidal bulge, an exaggerated water ellipse pointing at `bulgeAngle` (screen degrees). */
  bulge: z.number().min(0).max(1).default(0),
  bulgeAngle: z.number().min(-360).max(360).default(20),
  /** A curved arrow round the globe showing the spin (0…1 draws it on). */
  arrow: z.number().min(0).max(1).default(0),
  /** Dots on the surface (shown on the near side only). */
  points: z.array(lonLat).max(6).default([]),
  /** Faint lines every 30° so the spin reads over the oceans. */
  grid: z.boolean().default(true),
});

export const ClockParams = z.strictObject({
  /** Time in hours on the dial (tween it and the hands sweep). */
  time: z.number().min(-48).max(96).default(10.15),
  /** Hours per second the hands run on their own (0: still). */
  speed: z.number().min(-24).max(24).default(0),
  /** A 12-hour face, or a 24-hour face (one turn = one day). */
  dial: z.union([z.literal(12), z.literal(24)]).default(12),
  seconds: z.boolean().default(false),
  /** A shaded slice of the dial, in hours (`{ from: 23.5, to: 24 }` on a 24-hour face). 0…1 `fill` grows it. */
  wedge: z
    .strictObject({ from: z.number(), to: z.number(), color: color.default("myth"), label: text.optional(), fill: z.number().min(0).max(1).default(1) })
    .optional(),
  /** A digital read-out under the face ("23:59:60"). */
  digital: z.string().min(1).max(12).optional(),
  digitalColor: color.default("highlight"),
});

export const GrowthParams = z.strictObject({
  /** A rudist (a tall cup-shaped clam) or a horn coral: both grow upward from a point. */
  shape: z.enum(["rudist", "coral"]).default("rudist"),
  /** Growth lines drawn so far, from the tip up (tween it and the shell grows). */
  lines: z.number().min(0).max(400).default(60),
  /** Lines at full height. */
  total: z.number().int().min(4).max(400).default(60),
  /** Every Nth line is a thick yearly band (0: none). */
  yearEvery: z.number().int().min(0).max(400).default(0),
  /** 0…1: a magnifier on the newest lines, showing day and night layers. */
  lens: z.number().min(0).max(1).default(0),
  /** Show the count of lines beside the top. */
  tally: z.boolean().default(false),
  color: color.default("highlight"),
});

export const EarthMoonParams = z.strictObject({
  /** The Moon's orbit radius, fraction of the box's half width (tween it to push the Moon out). */
  distance: z.number().min(0.25).max(1).default(0.8),
  /** Where the Moon is, screen degrees (0 = right); `orbit` adds degrees per second. */
  moonAngle: z.number().min(-1440).max(1440).default(0),
  orbit: z.number().min(-90).max(90).default(0),
  /** The Earth's spin, degrees per second (the globe turns under the bulge). */
  spin: z.number().min(-360).max(360).default(40),
  /** 0…1: the tidal bulge, dragged `lag` degrees ahead of the Moon by the spin. */
  bulge: z.number().min(0).max(1).default(0),
  lag: z.number().min(-60).max(60).default(22),
  /** 0…1: the Moon's pull on the leading bulge and the brake on the spin, as arrows. */
  brake: z.number().min(0).max(1).default(0),
  /** 0…1: a laser pulse to the Moon (0…0.5) and back (0.5…1). */
  laser: z.number().min(0).max(1).default(0),
  /** A measured line from Earth to Moon with this text. */
  ruler: text.optional(),
});

export type GlobeP = z.infer<typeof GlobeParams>;
export type ClockP = z.infer<typeof ClockParams>;
export type GrowthP = z.infer<typeof GrowthParams>;
export type EarthMoonP = z.infer<typeof EarthMoonParams>;
