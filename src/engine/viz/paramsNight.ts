/**
 * Night-shift figure params (The Catch): data as things in the world, not charts on a fill.
 * `flap` (split-flap board), `crowd` (100 people, some lit), `stamp`, `phrase` (key-phrase card),
 * `prop` (a hero object under a light), `nickel` and `maya` (puppets drawn as figures),
 * `evidence` (pinned cards and red string), `phone` (a typed checklist).
 */
import { z } from "zod";
import { UnitSchema } from "./paramsData";

const short = z.string().min(1).max(40);
const tone = z.enum(["paper", "sodium", "ember", "neon"]);

export const FlapParams = z.strictObject({
  /** A number (tween it with a `set` cue and the tiles riffle), or `text`. */
  value: z.number().optional(),
  text: z.string().min(1).max(20).optional(),
  unit: UnitSchema,
  /** Thousands separators ("27,000,000,000"); off for years. */
  group: z.boolean().default(true),
  /** Pad to at least this many tiles (blank tiles on the left). */
  tiles: z.number().int().min(1).max(20).default(1),
  color: tone.default("sodium"),
  /** Mono line under the board ("unused gift cards, per person"). */
  caption: short.optional(),
});

export const CrowdParams = z.strictObject({
  count: z.number().int().min(10).max(200).default(100),
  /** How many hold a lit card (tween it to light them up one by one). */
  lit: z.number().min(0).max(200).default(0),
  rows: z.number().int().min(1).max(10).default(4),
  caption: short.optional(),
  seed: z.string().default("crowd"),
});

export const StampParams = z.strictObject({
  text: z.string().min(1).max(24),
  /** Small mono line inside the frame, under the word. */
  sub: z.string().min(1).max(32).optional(),
  color: tone.default("ember"),
  angle: z.number().min(-30).max(30).default(-8),
});

export const PhraseParams = z.strictObject({
  /** 1–3 lines of 2–6 words; the last is usually the Sodium one. */
  lines: z.array(z.strictObject({ text: z.string().min(1).max(40), color: tone.default("paper") })).min(1).max(3),
  align: z.enum(["start", "middle"]).default("start"),
  /** Text height, fraction of the box height per line. */
  size: z.number().min(0.1).max(1).default(0.42),
  /** A dark plate behind the words, for a light (daytime) set. */
  plate: z.boolean().default(false),
});

export const PROPS = ["drawer", "envelope", "giftcard", "till", "ledger", "jar", "cups", "coins", "vault", "cup", "lostbox", "book", "lamp"] as const;
export const PropParams = z.strictObject({
  prop: z.enum(PROPS),
  /** The prop's one motion, 0…1: drawer out, envelope open, till cash in, jar filled, coins piled, vault ticker, book open. */
  open: z.number().min(0).max(1).default(0),
  /** A light cone from above (the hero light). */
  cone: z.boolean().default(true),
  /** Words on the prop: the card's amount, the jar's label, the ledger's word. */
  text: z.string().min(1).max(24).optional(),
  /** ledger: SALE struck out 0…1. giftcard: split into two halves 0…1. cups: steam left 0…1. */
  strike: z.number().min(0).max(1).default(0),
  /** giftcard: turned over to the fine print 0…1. cups/coins: how many. */
  flip: z.number().min(0).max(1).default(0),
  count: z.number().int().min(1).max(12).default(5),
  /** Dim it (it's in the dark, not the hero). */
  dim: z.number().min(0).max(1).default(0),
});

export const NICKEL_EXPRESSIONS = ["smirk", "sly", "shock", "grin", "gotcha", "shh"] as const;
export const NICKEL_POSES = ["stand", "shh", "point", "sip", "hold", "close"] as const;
export const NickelParams = z.strictObject({
  expr: z.enum(NICKEL_EXPRESSIONS).default("smirk"),
  pose: z.enum(NICKEL_POSES).default("stand"),
  /** How much of Nickel is above the box's bottom edge, 0…1 (tween it: ears, eyes, then the rest, a peek over a counter). */
  rise: z.number().min(0).max(1).default(1),
  /** Mouth flaps while 1 (cue it on with the line). */
  talk: z.number().min(0).max(1).default(0),
  /** Headlamp on (0…1) and its beam: angle in degrees (0 = straight ahead, + down) and length 0…1. */
  lamp: z.number().min(0).max(1).default(1),
  beam: z.number().min(-60).max(80).default(20),
  beamLength: z.number().min(0).max(1).default(0),
  facing: z.enum(["left", "right"]).default("right"),
});

export const MayaParams = z.strictObject({
  outfit: z.enum(["pyjamas", "day"]).default("pyjamas"),
  expr: z.enum(["smile", "guilty", "soft", "wonder"]).default("smile"),
  /** Arm: down, holding the card up, or reaching forward (sliding it away / across a counter). */
  pose: z.enum(["stand", "hold", "reach"]).default("stand"),
  talk: z.number().min(0).max(1).default(0),
  facing: z.enum(["left", "right"]).default("right"),
});

export const EvidenceParams = z.strictObject({
  items: z.array(z.strictObject({ text: z.string().min(1).max(14), sub: z.string().min(1).max(28).optional() })).min(1).max(4),
  /** How many cards are lit and strung (tween it). */
  lit: z.number().min(0).max(4).default(0),
});

export const PhoneParams = z.strictObject({
  title: short.default("Tonight"),
  items: z.array(z.string().min(1).max(28)).min(1).max(5),
  /** Items typed so far (fractional: the next one is mid-typing). */
  typed: z.number().min(0).max(5).default(0),
  /** Items ticked. */
  done: z.number().min(0).max(5).default(0),
});

export type FlapP = z.infer<typeof FlapParams>;
export type CrowdP = z.infer<typeof CrowdParams>;
export type StampP = z.infer<typeof StampParams>;
export type PhraseP = z.infer<typeof PhraseParams>;
export type PropP = z.infer<typeof PropParams>;
export type NickelP = z.infer<typeof NickelParams>;
export type MayaP = z.infer<typeof MayaParams>;
export type EvidenceP = z.infer<typeof EvidenceParams>;
export type PhoneP = z.infer<typeof PhoneParams>;
