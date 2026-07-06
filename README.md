# 🎬 SaaS Demo Video Generator

A [Claude Code](https://claude.com/claude-code) skill that turns your running SaaS app into a **professional demo video** (.mp4) — Stripe/Linear product-tour style — with zero manual editing.

Describe your user journey, and Claude Code does the rest: launches your app, captures each screen with Playwright, then composes an animated video with Remotion (Ken Burns zooms, element highlights, synced text overlays, branded intro/outro).

**Perfect for:** landing pages, investor pitches, LinkedIn/X posts, `/features` pages — without hiring a motion designer.

## How it works

```
Brief (guided questionnaire)
        ↓
Auto-detection of your project (framework, port, dev command)
        ↓
App launched in the background
        ↓
Playwright captures → hi-res screenshots + highlight coordinates
        ↓
Remotion composition (Ken Burns, highlights, overlays, transitions)
        ↓
output/demo-video.mp4 delivered in your project
        ↓
Working directory cleaned up (only the video is kept)
```

**Why Claude Code and not regular chat:** the pipeline needs local network access (to run your app in dev mode), Playwright script execution, and video rendering via Remotion — all native to Claude Code's agentic environment.

## Installation

```
/plugin marketplace add barryaliou980/aliou-skills
/plugin install demo-video-generator@aliou-skills
```

## Usage

Open Claude Code at the root of your SaaS project and ask:

> Generate a demo video of my app

or

> Fais une vidéo démo de mon app

Claude will:

1. **Detect your project** — framework (Next.js, Vite, Nuxt, CRA, SvelteKit, Astro, Angular…), dev command, and port, then launch the app and wait until it responds.
2. **Ask you a short brief** — journey steps, action per step, element to highlight, key message per screen, test credentials, visual tone, target duration.
3. **Capture each screen** — waits for the right selector before every screenshot (never a blank/loading shot) and records the exact coordinates of the element to highlight. On captcha/2FA or a missing selector, it stops and asks you instead of failing silently.
4. **Compose the video** — per-screen Ken Burns zoom centered on the highlight, pulsing ring on the target element, synced text overlays, crossfade transitions, branded intro and CTA outro (colors pulled from your brief or your app's CSS theme).
5. **Export** — `output/demo-video.mp4`, 1920×1080 @ 30fps.
6. **Clean up** — deletes the working directory (Chromium, screenshots, the Remotion scaffold), so only `output/demo-video.mp4` is left behind.

## Example brief

```json
{
  "baseUrl": "http://localhost:3000",
  "branding": {
    "productName": "Viraflow",
    "tagline": "Ship viral content in minutes",
    "cta": "Try it free — viraflow.app",
    "primaryColor": "#6C5CE7"
  },
  "steps": [
    {
      "name": "landing",
      "actions": [{ "type": "goto", "url": "/" }],
      "highlightSelector": "[data-testid=hero-cta]",
      "message": "Create viral content in one click",
      "durationSec": 4
    }
  ]
}
```

Full format (auth, storageState, all action types) documented in [`skills/demo-video-generator/questionnaire.md`](skills/demo-video-generator/questionnaire.md).

## Requirements

- A web project with a `package.json` and a dev command (`npm run dev` / `npm start`)
- Node.js 18+
- Playwright, Chromium, and Remotion are installed automatically into `demo-video/` on first run (100% npm — nothing to install manually)

## Design choice (v1): animated static screenshots

v1 deliberately uses `page.screenshot()` rather than native video recording:

- **Resilient** — each capture waits for the target selector; a slow-loading screen just delays the shot, there's no footage to trim or retime
- **Fully controlled motion** — zooms, highlights, and pacing are simulated in Remotion, independent of your app's actual rendering fluidity
- **Professional product-tour look** — the Stripe/Linear aesthetic

**Roadmap v2:** real navigation recording (Playwright `recordVideo`) for a more authentic feel, optional background music, vertical formats (9:16) for social.

## Structure

```
skills/demo-video-generator/
  SKILL.md                       # Pipeline instructions for Claude
  questionnaire.md               # Brief questions + questionnaire.json format
  scripts/
    detect-app.js                # Framework / dev command / port detection
    playwright-runner.js         # Journey execution → screenshots + steps.json
  templates/remotion/            # Ready-to-scaffold video project
    src/Root.tsx                 # DemoVideo composition (timing, crossfades)
    src/ScreenHighlight.tsx      # Ken Burns + pulsing highlight + overlay
    src/Intro.tsx, Outro.tsx     # Branded title card and CTA
```

## License

MIT — [Aliou Barry](https://github.com/barryaliou980)
