import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { GlowText } from "../components/GlowText";

export const BlogScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 50 },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 0.75]);
  const rotateY = interpolate(entrance, [0, 1], [25, -5]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Slow scroll effect on the blog screenshot
  const scrollY = interpolate(frame, [30, 280], [0, -200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{ position: "absolute", top: "3%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <GlowText
          text="BLOG SEO + GEO"
          fontSize={36}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={600}
          style={{ textAlign: "center", letterSpacing: "0.2em" }}
        />
        <GlowText
          text="11 Articoli • Scheduling • Ottimizzazione AI"
          fontSize={20}
          delay={12}
          color="#ffffff70"
          glowColor="#ffffff"
          fontWeight={400}
          style={{ textAlign: "center", marginTop: 8 }}
        />
      </div>

      {/* 3D Blog screenshot */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translate(-50%, 0) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
          opacity,
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: "16px 16px 0 0",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
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
            spiegamelofacile.com/blog
          </div>
        </div>

        <div
          style={{
            width: 900,
            height: 700,
            overflow: "hidden",
            borderRadius: "0 0 16px 16px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <Img
            src={staticFile("recap/dashboard_blog.png")}
            style={{
              width: "100%",
              height: "auto",
              transform: `translateY(${scrollY}px)`,
            }}
          />
        </div>
      </div>

      {/* Stats badges */}
      <Badge frame={frame} delay={90} x="5%" y="80%" text="11 articoli pubblicati" icon="📝" />
      <Badge frame={frame} delay={110} x="38%" y="85%" text="SEO + GEO ottimizzato" icon="🔍" />
      <Badge frame={frame} delay={130} x="70%" y="80%" text="Scheduling automatico" icon="⏰" />
    </AbsoluteFill>
  );
};

const Badge: FC<{ frame: number; delay: number; x: string; y: string; text: string; icon: string }> = ({
  frame,
  delay,
  x,
  y,
  text,
  icon,
}) => {
  const localFrame = frame - delay;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(localFrame, [0, 15], [0.8, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(0,212,255,0.08)",
        border: "1px solid rgba(0,212,255,0.25)",
        borderRadius: 14,
        padding: "12px 22px",
        fontSize: 17,
        fontWeight: 600,
        color: "#00d4ff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      {text}
    </div>
  );
};
