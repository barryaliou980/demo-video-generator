import { Composition, Sequence, AbsoluteFill } from "remotion";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { ScreenHighlight, Step } from "./ScreenHighlight";
import steps from "../steps.json";
import questionnaire from "../questionnaire.json";

const FPS = 30;
const INTRO_SEC = 2.5;
const OUTRO_SEC = 3;
const CROSSFADE_FRAMES = 12; // overlap between consecutive screens

const branding = questionnaire.branding ?? {
  productName: "My Product",
  tagline: "",
  cta: "",
  primaryColor: "#6C5CE7",
  backgroundColor: "#0F0F14",
};

// Composition size must match the Playwright capture viewport so the
// highlight coordinates line up. Read it from the brief instead of hardcoding.
const viewport = questionnaire.viewport ?? { width: 1920, height: 1080 };

const typedSteps = steps as Step[];

const introFrames = Math.round(INTRO_SEC * FPS);
const outroFrames = Math.round(OUTRO_SEC * FPS);
const stepFrames = typedSteps.map((s) => Math.round(s.durationSec * FPS));
// Every element (intro, each screen, outro) overlaps its predecessor by
// CROSSFADE_FRAMES, so each screen's unique on-screen time is exactly its
// stepFrames and the total is a clean sum of the parts.
const totalFrames =
  introFrames + stepFrames.reduce((a, b) => a + b, 0) + outroFrames;

const DemoVideo: React.FC = () => {
  let cursor = introFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: branding.backgroundColor }}>
      <Sequence durationInFrames={introFrames}>
        <Intro branding={branding} />
      </Sequence>
      {typedSteps.map((step, i) => {
        // Start CROSSFADE_FRAMES early to overlap the previous element
        // (the intro for the first screen, the prior screen otherwise).
        const from = cursor - CROSSFADE_FRAMES;
        const duration = stepFrames[i] + CROSSFADE_FRAMES;
        cursor = from + duration; // advances by stepFrames[i]
        return (
          <Sequence key={step.name} from={from} durationInFrames={duration}>
            <ScreenHighlight
              step={step}
              accentColor={branding.primaryColor}
              fadeFrames={CROSSFADE_FRAMES}
            />
          </Sequence>
        );
      })}
      <Sequence
        from={cursor - CROSSFADE_FRAMES}
        durationInFrames={outroFrames + CROSSFADE_FRAMES}
      >
        <Outro branding={branding} fadeFrames={CROSSFADE_FRAMES} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition
    id="DemoVideo"
    component={DemoVideo}
    durationInFrames={totalFrames}
    fps={FPS}
    width={viewport.width}
    height={viewport.height}
  />
);
