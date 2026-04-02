import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { GlowText } from "../components/GlowText";

export const OutroScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance with bounce
  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80, mass: 0.8 },
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0, 1]);
  const logoOpacity = interpolate(logoEntrance, [0, 1], [0, 1]);

  // Rotating glow ring
  const ringRotation = frame * 0.8;
  const ringScale = interpolate(frame, [0, 60, 300], [0.5, 1, 1.1]);

  // Background pulse
  const bgPulse = interpolate(frame % 90, [0, 45, 90], [0.02, 0.06, 0.02]);

  return (
    <AbsoluteFill>
      {/* Pulsing background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,200,0,${bgPulse}) 0%, transparent 70%)`,
        }}
      />

      {/* Rotating ring */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${ringRotation}deg) scale(${ringScale})`,
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "2px solid rgba(255,200,0,0.15)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-ringRotation * 0.7}deg) scale(${ringScale * 0.85})`,
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.1)",
          opacity: 0.4,
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <Img
          src={staticFile("recap/spiegamelo_logo.png")}
          style={{ width: 180, height: 180 }}
        />
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: "48%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="SPIEGAMELO FACILE"
          fontSize={52}
          delay={15}
          color="#ffffff"
          glowColor="#ffc800"
          style={{ textAlign: "center" }}
        />
      </div>

      <div style={{ position: "absolute", top: "58%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="AI ti aiuta a lavorare meglio."
          fontSize={28}
          delay={30}
          color="#ffffff90"
          glowColor="#ffffff"
          fontWeight={400}
          style={{ textAlign: "center" }}
        />
      </div>

      {/* Built with line */}
      <div style={{ position: "absolute", top: "72%", width: "100%", textAlign: "center" }}>
        <BuiltWith frame={frame} />
      </div>

      {/* Bottom stats recap */}
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <MiniStat frame={frame} delay={70} value="65" label="commits" />
        <MiniStat frame={frame} delay={80} value="57K" label="linee" />
        <MiniStat frame={frame} delay={90} value="240" label="ore" />
        <MiniStat frame={frame} delay={100} value="€22.8K" label="valore" />
      </div>
    </AbsoluteFill>
  );
};

const BuiltWith: FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 50;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 0.6], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        color: "#ffffff40",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}
    >
      Costruito con Claude Code + PAI
    </div>
  );
};

const MiniStat: FC<{ frame: number; delay: number; value: string; label: string }> = ({
  frame,
  delay,
  value,
  label,
}) => {
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(localFrame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, textAlign: "center" }}>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#ffc800",
          fontFamily: "'Inter', monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#ffffff50",
          fontFamily: "'Inter', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
};
