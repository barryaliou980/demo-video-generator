#!/usr/bin/env node
/**
 * Executes the demo journey described in questionnaire.json:
 * for each step, plays the actions, waits for the target selector,
 * captures the screen and the highlight's boundingBox.
 *
 * Usage: node playwright-runner.js <path/questionnaire.json>
 * Output: screenshots/step-NN.png + steps.json (next to the questionnaire).
 *
 * Expected questionnaire format — see the skill's questionnaire.md.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const configPath = process.argv[2];
if (!configPath || !fs.existsSync(configPath)) {
  console.error("Usage: node playwright-runner.js <questionnaire.json>");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const outDir = path.dirname(path.resolve(configPath));
const screenshotsDir = path.join(outDir, "screenshots");
fs.mkdirSync(screenshotsDir, { recursive: true });

const VIEWPORT = config.viewport || { width: 1920, height: 1080 };
const DEFAULT_DURATION = 4; // seconds per screen when unspecified

async function runAction(page, action) {
  switch (action.type) {
    case "goto":
      await page.goto(new URL(action.url, config.baseUrl).href, {
        waitUntil: "networkidle",
      });
      break;
    case "click":
      await page.click(action.selector);
      break;
    case "fill":
      await page.fill(action.selector, action.value);
      break;
    case "scroll":
      if (action.selector) {
        await page.locator(action.selector).scrollIntoViewIfNeeded();
      } else {
        await page.mouse.wheel(0, action.value || 600);
      }
      break;
    case "wait":
      if (action.selector) await page.waitForSelector(action.selector);
      else await page.waitForTimeout(action.value || 1000);
      break;
    case "press":
      await page.keyboard.press(action.value);
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // high-resolution captures
    ...(config.storageState && fs.existsSync(config.storageState)
      ? { storageState: config.storageState }
      : {}),
  });
  const page = await context.newPage();

  // Optional authentication before the journey.
  if (config.auth && !config.storageState) {
    const a = config.auth;
    await page.goto(new URL(a.loginUrl, config.baseUrl).href, {
      waitUntil: "networkidle",
    });
    await page.fill(a.emailSelector, a.email);
    await page.fill(a.passwordSelector, a.password);
    await page.click(a.submitSelector);
    await page.waitForLoadState("networkidle");
  }

  const steps = [];
  for (let i = 0; i < config.steps.length; i++) {
    const step = config.steps[i];
    const label = step.name || `step-${i + 1}`;
    console.log(`▶ Step ${i + 1}/${config.steps.length}: ${label}`);

    try {
      for (const action of step.actions || []) {
        await runAction(page, action);
      }

      // Guarantees the screen is ready before capture (never a blank shot).
      const readySelector = step.readySelector || step.highlightSelector;
      if (readySelector) {
        await page.waitForSelector(readySelector, { timeout: 15000 });
      }
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(step.settleMs ?? 500); // CSS animations

      const imageName = `step-${String(i + 1).padStart(2, "0")}.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, imageName),
      });

      // Highlight coordinates in CSS pixels (viewport frame of reference,
      // identical to the Remotion composition dimensions).
      let highlight = null;
      if (step.highlightSelector) {
        const box = await page.locator(step.highlightSelector).boundingBox();
        if (box) {
          highlight = {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        } else {
          console.warn(
            `  ⚠ boundingBox not found for ${step.highlightSelector}`
          );
        }
      }

      steps.push({
        name: label,
        image: `screenshots/${imageName}`,
        message: step.message || "",
        highlight,
        durationSec: step.durationSec || DEFAULT_DURATION,
        viewport: VIEWPORT,
      });
    } catch (err) {
      // Explicit failure: capture the state for diagnosis and stop.
      // Claude must ask the user for manual intervention.
      const failPath = path.join(screenshotsDir, `FAILED-${label}.png`);
      await page.screenshot({ path: failPath }).catch(() => {});
      console.error(`✖ Failed at step "${label}": ${err.message}`);
      console.error(`  Diagnostic capture: ${failPath}`);
      await browser.close();
      process.exit(1);
    }
  }

  fs.writeFileSync(
    path.join(outDir, "steps.json"),
    JSON.stringify(steps, null, 2)
  );
  console.log(`✔ ${steps.length} screens captured → ${outDir}/steps.json`);
  await browser.close();
})();
