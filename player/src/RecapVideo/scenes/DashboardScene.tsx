import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { GlowText } from "../components/GlowText";

export const DashboardScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3D perspective rotation for screenshot
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 40, mass: 1.5 },
  });

  const rotateX = interpolate(entrance, [0, 1], [30, 8]);
  const rotateY = interpolate(entrance, [0, 1], [-15, -3]);
  const translateZ = interpolate(entrance, [0, 1], [-400, 0]);
  const scale = interpolate(entrance, [0, 1], [0.6, 0.85]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Slow pan effect
  const panX = interpolate(frame, [0, 450], [0, -30]);
  const panY = interpolate(frame, [0, 450], [0, -20]);

  // Glow scan line
  const scanY = interpolate(frame, [60, 300], [-10, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{ position: "absolute", top: "3%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <GlowText
          text="DASHBOARD"
          fontSize={36}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={600}
          style={{ textAlign: "center", letterSpacing: "0.3em" }}
        />
        <GlowText
          text="Content Engine — Redesign Completo"
          fontSize={22}
          delay={15}
          color="#ffffff80"
          glowColor="#ffffff"
          fontWeight={400}
          style={{ textAlign: "center", marginTop: 8 }}
        />
      </div>

      {/* 3D floating screenshot */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translate(-50%, 0) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
          opacity,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Screen glow */}
        <div
          style={{
            position: "absolute",
            inset: -30,
            background: "radial-gradient(ellipse at center, rgba(255,200,0,0.1) 0%, transparent 70%)",
            filter: "blur(30px)",
            zIndex: -1,
          }}
        />

        {/* Browser chrome */}
        <div
          style={{
            background: "linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)",
            borderRadius: "16px 16px 0 0",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div
            style={{
              marginLeft: 20,
              padding: "6px 40px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              fontSize: 13,
              color: "#ffffff60",
              fontFamily: "monospace",
            }}
          >
            spiegamelofacile.com/dashboard
          </div>
        </div>

        {/* Screenshot with overflow clip and pan */}
        <div
          style={{
            width: 1100,
            height: 680,
            overflow: "hidden",
            borderRadius: "0 0 16px 16px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <Img
            src={staticFile("recap/dashboard_home.png")}
            style={{
              width: "130%",
              height: "auto",
              transform: `translate(${panX}px, ${panY}px)`,
            }}
          />

          {/* Scan line effect */}
          <div
            style={{
              position: "absolute",
              top: `${scanY}%`,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(255,200,0,0.4), transparent)",
              filter: "blur(1px)",
              boxShadow: "0 0 20px rgba(255,200,0,0.2)",
            }}
          />
        </div>
      </div>

      {/* Feature callouts */}
      <Callout frame={frame} delay={120} x="3%" y="70%" text="Sidebar con gradient" />
      <Callout frame={frame} delay={150} x="60%" y="75%" text="Bozze automatiche AI" />
      <Callout frame={frame} delay={180} x="30%" y="82%" text="Research + Newsletter" />
    </AbsoluteFill>
  );
};

const Callout: FC<{ frame: number; delay: number; x: string; y: string; text: string }> = ({
  frame,
  delay,
  x,
  y,
  text,
}) => {
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(localFrame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "rgba(255,200,0,0.1)",
        border: "1px solid rgba(255,200,0,0.3)",
        borderRadius: 12,
        padding: "10px 20px",
        fontSize: 16,
        fontWeight: 600,
        color: "#ffc800",
        fontFamily: "'Inter', sans-serif",
        backdropFilter: "blur(10px)",
      }}
    >
      ✦ {text}
    </div>
  );
};
