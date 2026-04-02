import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { GlowText } from "../components/GlowText";
import { Card3D } from "../components/Card3D";

export const CostScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Estimated hours: 65 commits × ~3.5h average = ~240 hours
  // Human cost: €95/h senior full-stack dev Italy
  // Total: €22,800

  return (
    <AbsoluteFill>
      {/* Background matrix effect */}
      <MatrixRain frame={frame} />

      {/* Title */}
      <div style={{ position: "absolute", top: "4%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <GlowText
          text="IL COSTO UMANO EQUIVALENTE"
          fontSize={32}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={600}
          style={{ textAlign: "center", letterSpacing: "0.15em" }}
        />
      </div>

      {/* Hours section */}
      <div style={{ position: "absolute", top: "16%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <Card3D delay={15} style={{ display: "inline-block", width: "80%", maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div>
              <AnimatedCounter
                value={240}
                suffix="h"
                fontSize={88}
                label="Ore stimate"
                delay={15}
                duration={90}
                color="#00d4ff"
              />
            </div>
            <div
              style={{
                width: 2,
                height: 100,
                background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 18,
                  color: "#ffffff60",
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Composizione
              </div>
              <HoursBreakdown frame={frame} />
            </div>
          </div>
        </Card3D>
      </div>

      {/* Cost calculation */}
      <div style={{ position: "absolute", top: "48%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <Card3D delay={60} direction="right" style={{ display: "inline-block", width: "80%", maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22,
                  color: "#ffffff80",
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: 8,
                }}
              >
                Senior Full-Stack Dev
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#ffffff",
                  fontFamily: "'Inter', monospace",
                }}
              >
                €95/h
              </div>
            </div>
            <div
              style={{
                fontSize: 56,
                color: "#ffc800",
                fontWeight: 200,
              }}
            >
              ×
            </div>
            <AnimatedCounter
              value={22800}
              prefix="€"
              fontSize={78}
              label="Costo di mercato"
              delay={80}
              duration={100}
              color="#ff6b6b"
              format={(n) => n.toLocaleString("it-IT")}
            />
          </div>
        </Card3D>
      </div>

      {/* AI advantage callout */}
      <div style={{ position: "absolute", top: "78%", width: "100%", textAlign: "center", zIndex: 10 }}>
        <AIAdvantage frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

const HoursBreakdown: FC<{ frame: number }> = ({ frame }) => {
  const items = [
    { label: "Backend & API", hours: 80, color: "#ffc800" },
    { label: "Frontend & UI", hours: 70, color: "#00d4ff" },
    { label: "Infrastructure", hours: 45, color: "#50fa7b" },
    { label: "Content & AI", hours: 45, color: "#ff6b6b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const localFrame = frame - 30 - i * 8;
        const opacity = interpolate(localFrame, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const barWidth = interpolate(localFrame, [0, 40], [0, (item.hours / 80) * 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div key={i} style={{ opacity, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                fontSize: 14,
                color: "#ffffff80",
                fontFamily: "'Inter', sans-serif",
                width: 130,
                textAlign: "right",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                width: 140,
                height: 8,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  background: item.color,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${item.color}40`,
                }}
              />
            </div>
            <div style={{ fontSize: 14, color: item.color, fontWeight: 700, fontFamily: "monospace", width: 40 }}>
              {item.hours}h
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AIAdvantage: FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 180;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(localFrame, [0, 20], [0.9, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "inline-block",
        background: "linear-gradient(135deg, rgba(80,250,123,0.1) 0%, rgba(0,212,255,0.1) 100%)",
        border: "1px solid rgba(80,250,123,0.3)",
        borderRadius: 20,
        padding: "24px 48px",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          color: "#50fa7b",
        }}
      >
        Costruito con AI in 15 giorni
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 400,
          fontFamily: "'Inter', sans-serif",
          color: "#ffffff60",
          marginTop: 8,
        }}
      >
        Un team di 3 persone avrebbe impiegato ~2 mesi
      </div>
    </div>
  );
};

const MatrixRain: FC<{ frame: number }> = ({ frame }) => {
  const columns = 20;
  return (
    <AbsoluteFill style={{ opacity: 0.04, overflow: "hidden" }}>
      {Array.from({ length: columns }, (_, i) => {
        const x = (i / columns) * 100;
        const speed = 0.5 + (i % 4) * 0.3;
        const y = ((frame * speed + i * 40) % 120) - 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              fontSize: 14,
              fontFamily: "monospace",
              color: "#ffc800",
              whiteSpace: "pre",
              lineHeight: 1.5,
            }}
          >
            {"01\n10\n11\n00\n01\n10"}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
