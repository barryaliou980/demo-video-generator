# Demo Video Brief — Questionnaire

Ask the user these questions before generating anything. Save the answers as `demo-video/questionnaire.json` (format below). This file drives the pipeline and is deleted with the working directory at cleanup; to reuse the brief across sessions, save a copy outside `demo-video/` first.

## Questions

| Field | Question |
|---|---|
| **Journey steps** | What is the ordered list of screens/steps? (e.g., landing → signup → dashboard → create project → PDF export) |
| **Action per step** | For each step: what action gets there? (click, form fill, scroll, wait for a specific element) |
| **Highlight selector** | (optional) Which element (CSS selector / data-testid) should be visually highlighted on this screen? |
| **Key message per screen** | What value proposition or overlay text should appear during this step? |
| **Test credentials** | If the journey requires auth: demo account email/password + login page URL. |
| **Visual tone** | Fast/dynamic or calm/premium? |
| **Target duration** | Total desired video length (e.g., 30s, 60s). |
| **Branding** | Product name, tagline, CTA for the outro, brand colors (or "read from the app's CSS"). |

## `questionnaire.json` format

```json
{
  "baseUrl": "http://localhost:3000",
  "viewport": { "width": 1920, "height": 1080 },
  "tone": "fast",
  "targetDurationSec": 45,
  "branding": {
    "productName": "Viraflow",
    "tagline": "Ship viral content in minutes",
    "cta": "Try it free — viraflow.app",
    "primaryColor": "#6C5CE7",
    "backgroundColor": "#0F0F14"
  },
  "auth": {
    "loginUrl": "/login",
    "email": "demo@example.com",
    "password": "demo1234",
    "emailSelector": "input[name=email]",
    "passwordSelector": "input[name=password]",
    "submitSelector": "button[type=submit]"
  },
  "steps": [
    {
      "name": "landing",
      "actions": [{ "type": "goto", "url": "/" }],
      "highlightSelector": "[data-testid=hero-cta]",
      "message": "Create viral content in one click",
      "durationSec": 4
    },
    {
      "name": "dashboard",
      "actions": [
        { "type": "click", "selector": "[data-testid=hero-cta]" },
        { "type": "wait", "selector": "[data-testid=dashboard]" }
      ],
      "readySelector": "[data-testid=project-list]",
      "highlightSelector": "[data-testid=new-project-btn]",
      "message": "All your projects in one place",
      "durationSec": 5
    }
  ]
}
```

Notes:
- `auth` and `storageState` are optional; omit them for public journeys. If a captcha or 2FA blocks the login, ask the user to log in manually in a headed browser, save the `storageState`, and set `"storageState": "auth.json"`.
- Action types: `goto`, `click`, `fill`, `scroll`, `wait`, `press`.
- `readySelector` (optional) is waited on before the screenshot; defaults to `highlightSelector`.
- `durationSec` controls how long the screen stays in the final video.
