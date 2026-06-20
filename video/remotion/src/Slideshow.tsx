import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";
import manifest from "./manifest.json";

const BG = "#1b110e";
const GOLD = "#d9a441";
const CREAM = "#efe7d8";
const FADE = 14;

const FONT_DISPLAY =
  '"Archivo","Helvetica Neue",Arial,"Liberation Sans",sans-serif';
const FONT_MONO = '"Space Mono","DejaVu Sans Mono",monospace';

type Cue = { text: string; from: number; durationInFrames: number };
type SlideT = {
  n: number;
  img: string;
  audio: string;
  durationInFrames: number;
  chapter: string;
  subtitles: Cue[];
};

const Subtitle: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const cue = cues.find(
    (c) => frame >= c.from && frame < c.from + c.durationInFrames
  );
  if (!cue) return null;
  const local = frame - cue.from;
  const appear = interpolate(local, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(local, [0, 7], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 96,
        display: "flex",
        justifyContent: "center",
        padding: "0 220px",
      }}
    >
      <div
        style={{
          opacity: appear,
          transform: `translateY(${rise}px)`,
          background: "rgba(12,7,6,0.82)",
          border: `1px solid rgba(217,164,65,0.45)`,
          borderRadius: 10,
          padding: "16px 30px",
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 40,
          lineHeight: 1.32,
          fontWeight: 600,
          color: CREAM,
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

const ChapterLabel: React.FC<{ label: string; dur: number }> = ({
  label,
  dur,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(
    frame,
    [0, 12, dur - 12, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const x = interpolate(frame, [0, 14], [-24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        left: 64,
        opacity: o,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ width: 36, height: 3, background: GOLD }} />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 22,
          letterSpacing: 3,
          color: GOLD,
          fontWeight: 700,
          textShadow: "0 2px 12px rgba(0,0,0,0.7)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

const Slide: React.FC<{ slide: SlideT; even: boolean }> = ({ slide, even }) => {
  const frame = useCurrentFrame();
  const d = slide.durationInFrames;
  const opacity = interpolate(frame, [0, FADE, d - FADE, d], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(
    frame,
    [0, d],
    even ? [1.06, 1.0] : [1.0, 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill style={{ opacity }}>
        <Img
          src={staticFile(slide.img)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
        {/* bottom scrim for subtitle legibility */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to top, rgba(10,6,5,0.78) 0%, rgba(10,6,5,0.0) 26%)",
          }}
        />
        <Subtitle cues={slide.subtitles} />
      </AbsoluteFill>
      <Audio src={staticFile(slide.audio)} />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, manifest.totalFrames], [0, 100], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 6,
        background: "rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: GOLD,
          boxShadow: `0 0 14px ${GOLD}`,
        }}
      />
    </div>
  );
};

export const Slideshow: React.FC = () => {
  let cursor = 0;
  const slides = manifest.slides as SlideT[];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {slides.map((s, i) => {
        const from = cursor;
        cursor += s.durationInFrames;
        return (
          <Sequence key={s.n} from={from} durationInFrames={s.durationInFrames}>
            <Slide slide={s} even={i % 2 === 0} />
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};
