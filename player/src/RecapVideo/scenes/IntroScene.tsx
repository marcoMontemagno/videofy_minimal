import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { GlowText } from "../components/GlowText";

export const IntroScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background grid perspective animation
  const gridRotateX = interpolate(frame, [0, 150], [70, 55]);
  const gridTranslateZ = interpolate(frame, [0, 150], [-500, -200]);

  // Logo entrance with 3D flip
  const logoFlip = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 50, mass: 1.2 },
  });
  const logoRotateY = interpolate(logoFlip, [0, 1], [180, 0]);
  const logoScale = interpolate(logoFlip, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoFlip, [0, 0.3, 1], [0, 1, 1]);

  // Cinematic lens flare
  const flareOpacity = interpolate(frame, [60, 80, 120, 150], [0, 0.6, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Perspective grid floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-50%",
          width: "200%",
          height: "60%",
          transform: `perspective(800px) rotateX(${gridRotateX}deg) translateZ(${gridTranslateZ}px)`,
          backgroundImage:
            "linear-gradient(rgba(255,200,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,0,0.15) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />

      {/* Radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,200,0,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Logo with 3D flip */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: `translate(-50%, -50%) perspective(800px) rotateY(${logoRotateY}deg) scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <Img
          src={staticFile("recap/spiegamelo_logo.png")}
          style={{ width: 220, height: 220 }}
        />
      </div>

      {/* Title text */}
      <div style={{ position: "absolute", top: "48%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="SPIEGAMELO FACILE"
          fontSize={64}
          delay={20}
          glowColor="#ffc800"
          style={{ textAlign: "center" }}
        />
      </div>

      <div style={{ position: "absolute", top: "60%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="15 Giorni di Sviluppo"
          fontSize={42}
          delay={40}
          color="#ffffffcc"
          glowColor="#ffffff"
          fontWeight={400}
          style={{ textAlign: "center" }}
        />
      </div>

      <div style={{ position: "absolute", top: "70%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="12 — 27 Marzo 2026"
          fontSize={28}
          delay={55}
          color="#ffc80099"
          glowColor="#ffc800"
          fontWeight={300}
          style={{ textAlign: "center", letterSpacing: "0.2em" }}
        />
      </div>

      {/* Lens flare */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 200,
          background: "linear-gradient(90deg, transparent, rgba(255,200,0,0.3), transparent)",
          opacity: flareOpacity,
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};
