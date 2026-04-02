import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { RECAP_DATA } from "../index";
import { Card3D } from "../components/Card3D";
import { GlowText } from "../components/GlowText";

const FRAMES_PER_ACTIVITY = 85; // ~2.8s each
const VISIBLE_ACTIVITIES = 4;

export const ActivitiesScene: FC = () => {
  const frame = useCurrentFrame();
  const activities = RECAP_DATA.activities;

  // Current activity index (scrolling through)
  const rawIndex = frame / FRAMES_PER_ACTIVITY;
  const currentIndex = Math.min(Math.floor(rawIndex), activities.length - 1);

  return (
    <AbsoluteFill>
      {/* Section title */}
      <div style={{ position: "absolute", top: "4%", width: "100%", textAlign: "center" }}>
        <GlowText
          text="COSA ABBIAMO COSTRUITO"
          fontSize={32}
          delay={0}
          color="#ffc800"
          glowColor="#ffc800"
          fontWeight={600}
          style={{ textAlign: "center", letterSpacing: "0.2em" }}
        />
      </div>

      {/* Activity counter */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          right: "5%",
          fontSize: 20,
          fontFamily: "'Inter', monospace",
          color: "#ffc80080",
          fontWeight: 600,
        }}
      >
        {Math.min(currentIndex + 1, activities.length)}/{activities.length}
      </div>

      {/* Activity cards */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          left: "8%",
          right: "8%",
          bottom: "5%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {activities.map((activity, i) => {
          const activityFrame = frame - i * FRAMES_PER_ACTIVITY;

          if (activityFrame < -30 || activityFrame > FRAMES_PER_ACTIVITY * (VISIBLE_ACTIVITIES + 1)) {
            return null;
          }

          return (
            <ActivityCard
              key={i}
              icon={activity.icon}
              title={activity.title}
              desc={activity.desc}
              index={i}
              activityFrame={activityFrame}
              direction={i % 2 === 0 ? "left" : "right"}
            />
          );
        })}
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "2%",
          left: "8%",
          right: "8%",
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(((currentIndex + 1) / activities.length) * 100, 100)}%`,
            background: "linear-gradient(90deg, #ffc800, #ff6b6b)",
            borderRadius: 2,
            transition: "width 0.3s ease",
            boxShadow: "0 0 10px #ffc80060",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

interface ActivityCardProps {
  icon: string;
  title: string;
  desc: string;
  index: number;
  activityFrame: number;
  direction: "left" | "right";
}

const ActivityCard: FC<ActivityCardProps> = ({ icon, title, desc, index, activityFrame, direction }) => {
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, activityFrame),
    fps,
    config: { damping: 14, stiffness: 70 },
  });

  // Exit animation
  const exitFrame = activityFrame - FRAMES_PER_ACTIVITY * VISIBLE_ACTIVITIES;
  const exit = exitFrame > 0
    ? interpolate(exitFrame, [0, 20], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const dir = direction === "left" ? -1 : 1;
  const translateX = interpolate(entrance, [0, 1], [300 * dir, 0]);
  const rotateY = interpolate(entrance, [0, 1], [20 * dir, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]) * exit;

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        perspective: "1000px",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "28px 36px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,200,0,0.15)",
          borderRadius: 16,
          transform: `translateX(${translateX}px) perspective(800px) rotateY(${rotateY}deg)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ fontSize: 52, flexShrink: 0 }}>{icon}</div>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: "#ffffff",
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: "'Inter', sans-serif",
              color: "#ffffff80",
            }}
          >
            {desc}
          </div>
        </div>
        {/* Activity number badge */}
        <div
          style={{
            marginLeft: "auto",
            fontSize: 16,
            fontWeight: 800,
            color: "#ffc800",
            background: "rgba(255,200,0,0.1)",
            borderRadius: 12,
            padding: "8px 16px",
            flexShrink: 0,
            fontFamily: "monospace",
          }}
        >
          #{index + 1}
        </div>
      </div>
    </div>
  );
};
