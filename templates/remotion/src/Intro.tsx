import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type Branding = {
  productName: string;
  tagline?: string;
  cta?: string;
  primaryColor: string;
  backgroundColor: string;
};

export const Intro: React.FC<{ branding: Branding }> = ({ branding }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: branding.backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, sans-serif",
        opacity: exit,
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 110,
          fontWeight: 800,
          margin: 0,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40}px)`,
        }}
      >
        {branding.productName}
      </h1>
      {branding.tagline && (
        <p
          style={{
            color: branding.primaryColor,
            fontSize: 44,
            fontWeight: 500,
            marginTop: 24,
            opacity: interpolate(frame, [10, 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {branding.tagline}
        </p>
      )}
    </AbsoluteFill>
  );
};
