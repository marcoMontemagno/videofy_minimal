import type { FC, CSSProperties } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  fontSize?: number;
  color?: string;
  label?: string;
  format?: (n: number) => string;
  style?: CSSProperties;
}

export const AnimatedCounter: FC<Props> = ({
  value,
  suffix = "",
  prefix = "",
  duration = 60,
  delay = 0,
  fontSize = 96,
  color = "#ffc800",
  label,
  format,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame - delay,
    [0, duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Eased progress for smooth counting
  const eased = 1 - Math.pow(1 - progress, 3);
  const currentValue = Math.round(value * eased);

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const displayValue = format ? format(currentValue) : currentValue.toLocaleString("it-IT");

  return (
    <div
      style={{
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 900,
          fontFamily: "'Inter', 'SF Pro Display', monospace",
          color,
          letterSpacing: "-0.03em",
          textShadow: `0 0 30px ${color}60, 0 0 80px ${color}20`,
          lineHeight: 1,
        }}
      >
        {prefix}{displayValue}{suffix}
      </div>
      {label && (
        <div
          style={{
            fontSize: fontSize * 0.22,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            color: "#ffffff99",
            marginTop: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
