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

const typedSteps = steps as Step[];

const introFrames = Math.round(INTRO_SEC * FPS);
const outroFrames = Math.round(OUTRO_SEC * FPS);
const stepFrames = typedSteps.map((s) => Math.round(s.durationSec * FPS));
const totalFrames =
  introFrames +
  stepFrames.reduce((a, b) => a + b, 0) -
  CROSSFADE_FRAMES * Math.max(0, typedSteps.length - 1) +
  outroFrames;

const DemoVideo: React.FC = () => {
  let cursor = introFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: branding.backgroundColor }}>
      <Sequence durationInFrames={introFrames}>
        <Intro branding={branding} />
      </Sequence>
      {typedSteps.map((step, i) => {
        const from = cursor - (i > 0 ? CROSSFADE_FRAMES : 0);
        const duration = stepFrames[i] + (i > 0 ? CROSSFADE_FRAMES : 0);
        cursor = from + duration;
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
      <Sequence from={totalFrames - outroFrames} durationInFrames={outroFrames}>
        <Outro branding={branding} />
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
    width={1920}
    height={1080}
  />
);
