import { z } from "zod";
import type { CalculateMetadataFunction } from "remotion";

/**
 * Props for `ShortFromFootage`: one short cut from a long video. Written by the Python side
 * (`packages/shorts`, `shorts props`) from analysis.json + shorts.json + framing.json.
 * Frames are at the source fps; `spans` tile the video part of the short exactly.
 */
const keySchema = z.object({ f: z.number(), x: z.number().min(0).max(1) });

export const spanSchema = z.object({
  from: z.number().int().min(0),
  frames: z.number().int().min(1),
  /** First source frame this span plays. */
  srcFrom: z.number().int().min(0),
  layout: z.enum(["single", "letterbox"]),
  /** Index into the short's segments (teaser, main, ...). A segment change is a jump cut. */
  segment: z.number().int().min(0),
  /** `single`: window centre over time (span-relative frames, 0..1 of source width). */
  keys: z.array(keySchema).optional(),
});
export type Span = z.infer<typeof spanSchema>;

const wordSchema = z.object({ text: z.string(), startMs: z.number(), endMs: z.number() });
const captionLineSchema = z.object({ startMs: z.number(), speaker: z.string().optional(), words: z.array(wordSchema) });

export const brandSchema = z
  .object({
    /** The show or channel name on the bug and the end card. */
    name: z.string().optional(),
    accent: z.string().optional(),
    ink: z.string().optional(),
    paper: z.string().optional(),
    /** End-card call to action. */
    cta: z.string().optional(),
  })
  .default({});
export type Brand = z.infer<typeof brandSchema>;

export const shortSchema = z.object({
  id: z.string(),
  /** URL or `staticFile` path of the source video. */
  src: z.string(),
  fps: z.number().positive(),
  srcWidth: z.number().int(),
  srcHeight: z.number().int(),
  /** The 9:16 window as a fraction of source width. */
  window: z.number().min(0.05).max(1),
  videoFrames: z.number().int().min(1),
  durationInFrames: z.number().int().min(1),
  teaserFrames: z.number().int().min(0),
  titleFrames: z.number().int().min(0),
  spans: z.array(spanSchema).min(1),
  captions: z.array(captionLineSchema),
  title: z.string(),
  hook: z.string(),
  closing: z.string(),
  brand: brandSchema,
});
export type ShortProps = z.infer<typeof shortSchema>;

export const calculateShortMetadata: CalculateMetadataFunction<ShortProps> = ({ props }) => ({
  durationInFrames: props.durationInFrames,
  fps: props.fps,
  width: 1080,
  height: 1920,
});

/** Window centre at a span-relative frame: linear between keys, held at the ends. */
export const windowXAt = (keys: readonly { f: number; x: number }[], f: number): number => {
  if (!keys.length) return 0.5;
  if (f <= keys[0]!.f) return keys[0]!.x;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]!;
    const b = keys[i]!;
    if (f <= b.f) return b.f === a.f ? b.x : a.x + ((b.x - a.x) * (f - a.f)) / (b.f - a.f);
  }
  return keys[keys.length - 1]!.x;
};
