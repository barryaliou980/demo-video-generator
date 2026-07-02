#!/usr/bin/env node
/**
 * Detects the framework, dev command, and port of a web project.
 * Usage: node detect-app.js [project-path]
 * Output: JSON { framework, devCommand, port, url } on stdout.
 */
const fs = require("fs");
const path = require("path");

const projectDir = path.resolve(process.argv[2] || ".");
const pkgPath = path.join(projectDir, "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error(`No package.json found in ${projectDir}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const scripts = pkg.scripts || {};

// Detection order: meta-frameworks before the libs they embed.
const FRAMEWORKS = [
  { name: "next", match: "next", port: 3000 },
  { name: "nuxt", match: "nuxt", port: 3000 },
  { name: "remix", match: "@remix-run/dev", port: 3000 },
  { name: "sveltekit", match: "@sveltejs/kit", port: 5173 },
  { name: "astro", match: "astro", port: 4321 },
  { name: "vite", match: "vite", port: 5173 },
  { name: "cra", match: "react-scripts", port: 3000 },
  { name: "angular", match: "@angular/cli", port: 4200 },
];

const detected =
  FRAMEWORKS.find((f) => deps[f.match]) || { name: "unknown", port: 3000 };

// Start command: prefer dev, fall back to start/serve.
let devCommand = null;
if (scripts.dev) devCommand = "npm run dev";
else if (scripts.start) devCommand = "npm start";
else if (scripts.serve) devCommand = "npm run serve";

// An explicit port in the dev script overrides the framework default.
let port = detected.port;
const devScript = scripts.dev || scripts.start || scripts.serve || "";
const portFlag = devScript.match(/(?:-p|--port)[= ](\d{2,5})/);
const portEnv = devScript.match(/PORT=(\d{2,5})/);
if (portFlag) port = parseInt(portFlag[1], 10);
else if (portEnv) port = parseInt(portEnv[1], 10);

console.log(
  JSON.stringify(
    {
      framework: detected.name,
      devCommand,
      port,
      url: `http://localhost:${port}`,
    },
    null,
    2
  )
);
