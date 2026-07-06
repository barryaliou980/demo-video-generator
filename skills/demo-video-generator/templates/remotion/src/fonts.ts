import { loadFont } from "@remotion/google-fonts/Inter";

// Load Inter for real (bundled with the render) instead of relying on a
// silent system fallback. Weights cover every use across Intro/Outro/screens.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "800"],
});
