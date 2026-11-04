import React, { useMemo } from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { buildCaptionPages } from "../../engine/text/captions";
import { Subtitles } from "../../engine/text/Subtitles";
import { SafeAreaSchema, safeRect } from "../../engine/text/safeArea";
import { easeOutBack, easeOutCubic } from "../../engine/lib/easing";
import safeAreaJson from "../../data/safe-area.json";
import { TEXT_FONT } from "../fonts";
import { windowXAt, type Brand, type ShortProps, type Span } from "./shortData";

const W = 1080;
const H = 1920;
/** Audio fade at a jump cut (teaser → main), frames each side. */
const FADE = 4;
const safeArea = SafeAreaSchema.parse(safeAreaJson);

const colours = (b: Brand) => ({
  accent: b.accent ?? "#ffd84a",
  ink: b.ink ?? "#111114",
  paper: b.paper ?? "#ffffff",
});

/** One span of source footage, framed as a following 9:16 window or a letterbox over a blur. */
const SpanVideo: React.FC<{ span: Span; src: string; srcW: number; srcH: number; fadeIn: boolean; fadeOut: boolean }> = ({
  span,
  src,
  srcW,
  srcH,
  fadeIn,
  fadeOut,
}) => {
  const f = useCurrentFrame();
  const volume = (vf: number) =>
    Math.min(fadeIn ? interpolate(vf, [0, FADE], [0, 1], { extrapolateRight: "clamp" }) : 1,
      fadeOut ? interpolate(vf, [span.frames - FADE, span.frames], [1, 0], { extrapolateLeft: "clamp" }) : 1);
  if (span.layout === "single") {
    const scaledW = (H * srcW) / srcH;
    const x = windowXAt(span.keys ?? [], f);
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
        <OffthreadVideo
          src={src}
          trimBefore={span.srcFrom}
          volume={volume}
          style={{ position: "absolute", height: H, width: scaledW, left: W / 2 - x * scaledW, top: 0, maxWidth: "none" }}
        />
      </AbsoluteFill>
    );
  }
  const fgH = (W * srcH) / srcW;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        src={src}
        trimBefore={span.srcFrom}
        muted
        style={{ position: "absolute", height: H, width: (H * srcW) / srcH, left: W / 2 - (H * srcW) / srcH / 2, filter: "blur(38px) brightness(0.55)", transform: "scale(1.15)", maxWidth: "none" }}
      />
      <OffthreadVideo
        src={src}
        trimBefore={span.srcFrom}
        volume={volume}
        style={{ position: "absolute", width: W, height: fgH, left: 0, top: H * 0.48 - fgH / 2, boxShadow: "0 20px 60px #0009" }}
      />
    </AbsoluteFill>
  );
};

/** Big text on a plate, popping in. */
const Card: React.FC<{ text: string; from: number; to: number; y: number; size: number; brand: Brand; tone: "plate" | "accent" }> = ({ text, from, to, y, size, brand, tone }) => {
  const frame = useCurrentFrame();
  if (!text || frame < from || frame >= to) return null;
  const c = colours(brand);
  const t = frame - from;
  const pop = 0.7 + 0.3 * easeOutBack(t / 8, 1.6);
  const out = interpolate(frame, [to - 6, to], [1, 0], { extrapolateLeft: "clamp" });
  const safe = safeRect(safeArea, W, H);
  return (
    <div
      style={{
        position: "absolute",
        left: safe.x,
        width: safe.w,
        top: y * H,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) scale(${pop})`,
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: TEXT_FONT,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.1,
          textAlign: "center",
          padding: "22px 34px",
          borderRadius: 28,
          color: tone === "accent" ? c.ink : c.paper,
          backgroundColor: tone === "accent" ? c.accent : `${c.ink}e6`,
          boxShadow: "0 12px 40px #0008",
          maxWidth: safe.w,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const BrandBug: React.FC<{ brand: Brand; until: number }> = ({ brand, until }) => {
  const frame = useCurrentFrame();
  if (!brand.name || frame >= until) return null;
  const c = colours(brand);
  const safe = safeRect(safeArea, W, H);
  return (
    <div
      style={{
        position: "absolute",
        left: safe.x,
        top: safe.y,
        fontFamily: TEXT_FONT,
        fontWeight: 800,
        fontSize: 34,
        color: c.ink,
        backgroundColor: c.accent,
        padding: "8px 20px",
        borderRadius: 999,
        opacity: 0.92,
      }}
    >
      {brand.name}
    </div>
  );
};

const Progress: React.FC<{ until: number; brand: Brand }> = ({ until, brand }) => {
  const frame = useCurrentFrame();
  if (frame >= until) return null;
  return <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: (W * frame) / until, backgroundColor: colours(brand).accent }} />;
};

const EndCard: React.FC<{ props: ShortProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const c = colours(props.brand);
  const last = props.spans[props.spans.length - 1]!;
  const t = easeOutCubic(frame / 12);
  return (
    <AbsoluteFill>
      <Freeze frame={0}>
        <AbsoluteFill style={{ filter: `blur(${24 * t}px) brightness(${1 - 0.5 * t})` }}>
          <SpanVideo span={{ ...last, srcFrom: last.srcFrom + last.frames - 1, frames: 1 }} src={props.src} srcW={props.srcWidth} srcH={props.srcHeight} fadeIn={false} fadeOut={false} />
        </AbsoluteFill>
      </Freeze>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 48, padding: 90, opacity: t }}>
        <div style={{ fontFamily: TEXT_FONT, fontWeight: 900, fontSize: 82, lineHeight: 1.12, color: c.paper, textAlign: "center", textShadow: "0 6px 30px #000a" }}>
          {props.closing}
        </div>
        {props.brand.name ? (
          <div style={{ fontFamily: TEXT_FONT, fontWeight: 800, fontSize: 46, color: c.ink, backgroundColor: c.accent, padding: "14px 34px", borderRadius: 999 }}>
            {props.brand.cta ?? `More from ${props.brand.name}`}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ShortFromFootage: React.FC<ShortProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(() => buildCaptionPages(props.captions), [props.captions]);
  const { spans, videoFrames, teaserFrames, titleFrames } = props;
  const hookTo = teaserFrames > 0 ? teaserFrames : Math.round(2.5 * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {spans.map((span, i) => {
        const prev = spans[i - 1];
        const next = spans[i + 1];
        const jumpIn = !prev || prev.segment !== span.segment;
        const jumpOut = !next || next.segment !== span.segment;
        return (
          <Sequence key={i} from={span.from} durationInFrames={span.frames} premountFor={fps}>
            <SpanVideo span={span} src={props.src} srcW={props.srcWidth} srcH={props.srcHeight} fadeIn={jumpIn && i > 0} fadeOut={jumpOut} />
          </Sequence>
        );
      })}
      <Subtitles
        pages={pages}
        frame={frame}
        fps={fps}
        width={W}
        height={H}
        safeArea={safeArea}
        style={{ fontFamily: TEXT_FONT }}
        y={0.66}
        hidden={frame >= videoFrames}
      />
      <Card text={props.hook} from={0} to={hookTo} y={0.25} size={70} brand={props.brand} tone="accent" />
      <Card text={props.title} from={teaserFrames} to={teaserFrames + titleFrames} y={0.25} size={64} brand={props.brand} tone="plate" />
      <BrandBug brand={props.brand} until={videoFrames} />
      <Progress until={videoFrames} brand={props.brand} />
      <Sequence from={videoFrames}>
        <EndCard props={props} />
      </Sequence>
    </AbsoluteFill>
  );
};
