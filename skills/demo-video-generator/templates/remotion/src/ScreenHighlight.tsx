import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";

export type Step = {
  name: string;
  image: string;
  message: string;
  highlight: { x: number; y: number; width: number; height: number } | null;
  durationSec: number;
  viewport: { width: number; height: number };
};

/**
 * One animated screen: Ken Burns zoom on the screenshot, pulsing ring on the
 * highlighted element, and a synced text overlay. Image + highlight live in
 * the same scaled container so the ring tracks the zoom.
 */
export const ScreenHighlight: React.FC<{
  step: Step;
  accentColor: string;
  fadeFrames: number;
}> = ({ step, accentColor, fadeFrames }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();

  // Crossfade in/out with neighboring screens.
  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ken Burns: slow push from 100% to 108%, biased toward the highlight.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const origin = step.highlight
    ? `${((step.highlight.x + step.highlight.width / 2) / step.viewport.width) * 100}% ${((step.highlight.y + step.highlight.height / 2) / step.viewport.height) * 100}%`
    : "50% 50%";

  // Screenshot coordinates are in viewport CSS pixels; map to composition size.
  const sx = width / step.viewport.width;
  const sy = height / step.viewport.height;

  const pulse = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2);
  const ringOpacity = interpolate(frame, [fadeFrames, fadeFrames + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textProgress = interpolate(
    frame,
    [fadeFrames + 5, fadeFrames + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        <Img
          src={staticFile(step.image)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {step.highlight && (
          <div
            style={{
              position: "absolute",
              left: step.highlight.x * sx - 12,
              top: step.highlight.y * sy - 12,
              width: step.highlight.width * sx + 24,
              height: step.highlight.height * sy + 24,
              border: `4px solid ${accentColor}`,
              borderRadius: 12,
              boxShadow: `0 0 0 6px ${accentColor}33, 0 0 40px ${accentColor}66`,
              opacity: ringOpacity,
              transform: `scale(${pulse})`,
            }}
          />
        )}
      </AbsoluteFill>
      {step.message && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: textProgress,
            transform: `translateY(${(1 - textProgress) * 30}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(10, 10, 16, 0.82)",
              color: "white",
              padding: "20px 44px",
              borderRadius: 16,
              fontSize: 42,
              fontWeight: 600,
              fontFamily,
              maxWidth: "70%",
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            {step.message}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
