import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { GlowText } from "../components/GlowText";
import { Card3D } from "../components/Card3D";

const BEFORE_ITEMS = [
  { label: "Dashboard", status: "Base, design generico", score: 3 },
  { label: "Publishing", status: "Postiz, solo LinkedIn/X", score: 4 },
  { label: "Blog", status: "Non esistente", score: 0 },
  { label: "Newsletter", status: "Template base", score: 3 },
  { label: "Instagram", status: "Manuale", score: 1 },
  { label: "Security", status: "Minimale", score: 2 },
  { label: "Backup", status: "Nessuno", score: 0 },
  { label: "Research", status: "v1 base", score: 4 },
];

const AFTER_ITEMS = [
  { label: "Dashboard", status: "Redesign completo, design system", score: 9 },
  { label: "Publishing", status: "Zernio, 4 piattaforme", score: 8 },
  { label: "Blog", status: "11 articoli, SEO+GEO, scheduling", score: 8 },
  { label: "Newsletter", status: "Branding, analytics, automazione", score: 7 },
  { label: "Instagram", status: "Carousel automatici", score: 7 },
  { label: "Security", status: "Audit, XSS fix, property tests", score: 7 },
  { label: "Backup", status: "DR completo, bootstrap", score: 8 },
  { label: "Research", status: "v2, 54 moduli, quality gates", score: 8 },
];

export const ProgressScene: FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{ position: "absolute", top: "3%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <GlowText
          text="PRIMA → DOPO"
          fontSize={36}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={700}
          style={{ textAlign: "center", letterSpacing: "0.2em" }}
        />
      </div>

      {/* Two columns */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "3%",
          right: "3%",
          bottom: "5%",
          display: "flex",
          gap: 24,
        }}
      >
        {/* BEFORE column */}
        <Card3D delay={10} direction="left" style={{ flex: 1, padding: "24px 28px" }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ff6b6b",
              fontFamily: "'Inter', sans-serif",
              marginBottom: 20,
              textAlign: "center",
              letterSpacing: "0.1em",
            }}
          >
            12 MARZO
          </div>
          {BEFORE_ITEMS.map((item, i) => (
            <ProgressRow
              key={i}
              label={item.label}
              status={item.status}
              score={item.score}
              frame={frame}
              delay={20 + i * 10}
              color="#ff6b6b"
            />
          ))}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <ScoreTotal items={BEFORE_ITEMS} frame={frame} delay={100} color="#ff6b6b" />
          </div>
        </Card3D>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 48,
            color: "#ffc800",
          }}
        >
          <ArrowAnimation frame={frame} />
        </div>

        {/* AFTER column */}
        <Card3D delay={30} direction="right" style={{ flex: 1, padding: "24px 28px" }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#50fa7b",
              fontFamily: "'Inter', sans-serif",
              marginBottom: 20,
              textAlign: "center",
              letterSpacing: "0.1em",
            }}
          >
            27 MARZO
          </div>
          {AFTER_ITEMS.map((item, i) => (
            <ProgressRow
              key={i}
              label={item.label}
              status={item.status}
              score={item.score}
              frame={frame}
              delay={40 + i * 10}
              color="#50fa7b"
            />
          ))}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <ScoreTotal items={AFTER_ITEMS} frame={frame} delay={120} color="#50fa7b" />
          </div>
        </Card3D>
      </div>
    </AbsoluteFill>
  );
};

interface RowProps {
  label: string;
  status: string;
  score: number;
  frame: number;
  delay: number;
  color: string;
}

const ProgressRow: FC<RowProps> = ({ label, status, score, frame, delay, color }) => {
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const barWidth = interpolate(localFrame, [0, 30], [0, score * 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 90,
          fontSize: 13,
          fontWeight: 600,
          color: "#ffffffcc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            boxShadow: `0 0 8px ${color}30`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          fontFamily: "monospace",
          width: 30,
          textAlign: "right",
        }}
      >
        {score}
      </div>
    </div>
  );
};

const ScoreTotal: FC<{ items: typeof BEFORE_ITEMS; frame: number; delay: number; color: string }> = ({
  items,
  frame,
  delay,
  color,
}) => {
  const total = items.reduce((s, i) => s + i.score, 0);
  const max = items.length * 10;
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ opacity }}>
      <span
        style={{
          fontSize: 36,
          fontWeight: 900,
          color,
          fontFamily: "'Inter', monospace",
        }}
      >
        {total}
      </span>
      <span
        style={{
          fontSize: 20,
          color: "#ffffff40",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        /{max}
      </span>
    </div>
  );
};

const ArrowAnimation: FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(frame, [0, 30, 60], [1, 1.2, 1], {
    extrapolateRight: "extend",
  });
  const loopedPulse = interpolate(frame % 60, [0, 30, 60], [1, 1.15, 1]);
  const opacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${loopedPulse})`,
        textShadow: "0 0 20px rgba(255,200,0,0.4)",
      }}
    >
      →
    </div>
  );
};
