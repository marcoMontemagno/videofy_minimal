import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FC } from "react";

interface Props {
  logo: string;
  url?: string;
  backgroundColor?: string;
  textColor?: string;
  durationInFrames: number;
}

export const OutroSlide: FC<Props> = ({
  logo,
  url = "spiegamelofacile.com",
  backgroundColor = "#F5F0EB",
  textColor = "#FF6B35",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in over 0.5 seconds
  const fadeInFrames = Math.round(fps * 0.5);
  const opacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle scale animation on logo
  const logoScale = interpolate(frame, [0, fadeInFrames, durationInFrames], [0.8, 1, 1.02], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <Img
        src={logo}
        style={{
          width: 280,
          height: 280,
          objectFit: "contain",
          transform: `scale(${logoScale})`,
          marginBottom: 40,
        }}
      />
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: textColor,
          letterSpacing: 1,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {url}
      </div>
    </AbsoluteFill>
  );
};
