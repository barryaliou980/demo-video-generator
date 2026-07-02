import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Branding } from "./Intro";

export const Outro: React.FC<{ branding: Branding }> = ({ branding }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: branding.backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, sans-serif",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 90,
          fontWeight: 800,
          margin: 0,
          opacity: enter,
          transform: `scale(${0.9 + enter * 0.1})`,
        }}
      >
        {branding.productName}
      </h1>
      {branding.cta && (
        <div
          style={{
            marginTop: 40,
            padding: "22px 56px",
            borderRadius: 999,
            background: branding.primaryColor,
            color: "white",
            fontSize: 40,
            fontWeight: 600,
            opacity: interpolate(frame, [12, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {branding.cta}
        </div>
      )}
    </AbsoluteFill>
  );
};
