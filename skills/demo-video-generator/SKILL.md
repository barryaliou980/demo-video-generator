---
name: demo-video-generator
description: Use when the user wants a demo video, product tour, or presentation video of their SaaS app for a landing page, investor pitch, or social media (LinkedIn, X). Triggers - "demo video", "product tour", "presentation video", "promo video", « vidéo démo », « vidéo de présentation ».
---

# SaaS Demo Video Generator

## Overview

Generates a professional presentation video (.mp4) of a SaaS app from a user journey: Playwright screenshots animated and composed with Remotion (Ken Burns, highlights, text overlays), in the Stripe/Linear product-tour style.

**Prerequisite:** run from the root of a web project with a `package.json` and a dev command.

**v1 choice:** animated static screenshots (no native video recording). More resilient — wait for the right selector before each capture, and all motion is simulated in Remotion.

## Pipeline

All artifacts live in `demo-video/` at the target project root. `SKILL_DIR` below refers to this skill's own directory (`${CLAUDE_PLUGIN_ROOT}/skills/demo-video-generator` when installed as a plugin).

### Step 0 — Project detection

```bash
node "$SKILL_DIR/scripts/detect-app.js"
```

Returns `{ framework, devCommand, port, url }` as JSON. Then launch the app in the background with the detected command and poll the URL until it responds (max ~60s):

```bash
until curl -s -o /dev/null http://localhost:<port>; do sleep 2; done
```

If the app is already running on the port, do not relaunch it.

### Step 1 — Questionnaire (user brief)

Ask the user the questions from `questionnaire.md` (via AskUserQuestion or in conversation). Do NOT invent the journey: steps, key messages, and credentials come from the user.

Save the answers to `demo-video/questionnaire.json` (format documented in `questionnaire.md`). This file is reusable to regenerate the video later.

### Step 2 — Playwright captures

```bash
cd demo-video && npm install playwright && npx playwright install chromium
node "$SKILL_DIR/scripts/playwright-runner.js" demo-video/questionnaire.json
```

The runner executes each step (navigation, clicks, form fills), waits for the target selector before each capture, screenshots at high resolution, and records the `boundingBox()` of the element to highlight.

**Output:** `demo-video/screenshots/` + `demo-video/steps.json`.

**If a step fails** (captcha, 2FA, selector not found): stop, show the error to the user, and ask for manual intervention. Never fail silently or skip the step.

### Step 3 — Remotion composition

Scaffold the Remotion project in `demo-video/`:

1. Copy `$SKILL_DIR/templates/remotion/src/` (Root.tsx, Intro.tsx, ScreenHighlight.tsx, Outro.tsx, index.ts) into `demo-video/src/`
2. Copy `$SKILL_DIR/templates/remotion/package.json` and `tsconfig.json` into `demo-video/`, then `npm install`
3. Expose the captures to Remotion (`staticFile()` serves from `public/`): `mkdir -p demo-video/public && cp -r demo-video/screenshots demo-video/public/`
4. Customize Intro/Outro: product name, tagline, CTA, and brand colors (read the questionnaire answers; draw from the project's CSS theme if available)
5. Adjust pacing to the requested visual tone (fast/dynamic → short durations, snappy transitions; calm/premium → slower, crossfades)

### Step 4 — Export

```bash
cd demo-video && npx remotion render DemoVideo ../output/demo-video.mp4
```

Verify the file exists and report its size/duration to the user.

## Quick reference

| File | Role |
|---|---|
| `scripts/detect-app.js` | Detects framework, dev command, port |
| `scripts/playwright-runner.js` | Captures + highlight coordinates → `steps.json` |
| `templates/remotion/` | React compositions: Intro, animated screens, Outro |
| `questionnaire.md` | Brief questions + `questionnaire.json` format |

## Common mistakes

- **Capturing a loading screen** → always `waitFor` (selector or network idle) before `screenshot()`; the runner handles this when `readySelector` or `highlightSelector` is set.
- **Misaligned highlight** → the Playwright viewport and the Remotion composition must share the same logical dimensions (1920×1080 by default; never change one without the other).
- **App not ready when the runner starts** → poll the port first; never rely on a fixed `sleep`.
- **Auth required** → use the test credentials from the brief; on captcha/2FA, ask the user to log in manually, then reuse the `storageState`.
