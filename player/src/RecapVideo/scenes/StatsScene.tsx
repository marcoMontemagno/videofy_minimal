import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { GlowText } from "../components/GlowText";

export const StatsScene: FC = () => {
  const frame = useCurrentFrame();

  // Background sweep
  const sweepX = interpolate(frame, [0, 240], [-100, 100]);

  return (
    <AbsoluteFill>
      {/* Diagonal sweep light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${sweepX}%`,
          width: "30%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,200,0,0.03), transparent)",
          transform: "skewX(-15deg)",
        }}
      />

      {/* Section title */}
      <div style={{ position: "absolute", top: "8%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="I NUMERI"
          fontSize={32}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={600}
          style={{ textAlign: "center", letterSpacing: "0.3em" }}
        />
      </div>

      {/* Stats grid */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "5%",
          right: "5%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <StatBox delay={10}>
          <AnimatedCounter value={65} fontSize={108} label="Commits" delay={10} duration={80} />
        </StatBox>
        <StatBox delay={20}>
          <AnimatedCounter
            value={57}
            suffix="K"
            fontSize={108}
            label="Linee di codice"
            delay={20}
            duration={80}
            color="#00d4ff"
          />
        </StatBox>
        <StatBox delay={30}>
          <AnimatedCounter value={6} fontSize={108} label="Progetti" delay={30} duration={60} color="#ff6b6b" />
        </StatBox>
        <StatBox delay={40}>
          <AnimatedCounter value={15} fontSize={108} label="Giorni" delay={40} duration={60} color="#50fa7b" />
        </StatBox>
      </div>
    </AbsoluteFill>
  );
};

const StatBox: FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 60 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: "42%",
        padding: "40px 20px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
};
