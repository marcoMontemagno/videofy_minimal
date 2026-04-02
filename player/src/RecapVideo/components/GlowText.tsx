import type { FC, CSSProperties } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface Props {
  text: string;
  fontSize?: number;
  color?: string;
  glowColor?: string;
  delay?: number;
  style?: CSSProperties;
  fontWeight?: number;
}

export const GlowText: FC<Props> = ({
  text,
  fontSize = 72,
  color = "#ffffff",
  glowColor = "#ffc800",
  delay = 0,
  style = {},
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const glowPulse = interpolate(
    frame - delay,
    [0, 30, 60],
    [0, 1, 0.6],
    { extrapolateRight: "clamp" }
  );

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
        textShadow: `0 0 ${20 * glowPulse}px ${glowColor}, 0 0 ${60 * glowPulse}px ${glowColor}40`,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
