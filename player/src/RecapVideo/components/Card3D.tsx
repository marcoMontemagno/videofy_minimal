import type { FC, ReactNode, CSSProperties } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right";
  style?: CSSProperties;
  rotateAmount?: number;
}

export const Card3D: FC<Props> = ({
  children,
  delay = 0,
  direction = "left",
  style = {},
  rotateAmount = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 70, mass: 1 },
  });

  const dir = direction === "left" ? -1 : 1;
  const rotateY = interpolate(entrance, [0, 1], [rotateAmount * dir, 0]);
  const translateX = interpolate(entrance, [0, 1], [200 * dir, 0]);
  const translateZ = interpolate(entrance, [0, 1], [-300, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        perspective: "1200px",
        perspectiveOrigin: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "32px 40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};
