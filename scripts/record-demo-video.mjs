#!/usr/bin/env node
/**
 * Records an automated demo walkthrough of Expat Concierge V3.
 * Prerequisites: server running (npm start) and Playwright chromium installed.
 *
 * Usage:
 *   npm run record-demo
 *   DEMO_URL=http://localhost:3000/v3?autoplay=1&demo=1 npm run record-demo
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "docs", "demo-video-raw");
const OUT_FILE = path.join(ROOT, "docs", "Expat_Concierge_V3_Demo.webm");
const DEMO_URL =
  process.env.DEMO_URL || "http://localhost:3000/v3?autoplay=1&demo=1";
const WAIT_MS = Number(process.env.DEMO_WAIT_MS || 95000);

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });

console.log("Recording demo from:", DEMO_URL);
console.log("Wait time:", WAIT_MS, "ms");

async function launchBrowser() {
  const opts = { headless: true };
  try {
    return await chromium.launch(opts);
  } catch (_) {
    console.log("Bundled Chromium missing — trying system Chrome…");
    return await chromium.launch({ ...opts, channel: "chrome" });
  }
}

function ffmpegAvailable() {
  const home = process.env.HOME || "";
  const candidates = [
    path.join(home, "Library/Caches/ms-playwright/ffmpeg-1010/ffmpeg-mac"),
    path.join(home, "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac"),
  ];
  return candidates.some((p) => fs.existsSync(p));
}

const browser = await launchBrowser();
const useVideo = ffmpegAvailable();

const context = await browser.newContext(
  useVideo
    ? {
        recordVideo: { dir: RAW_DIR, size: { width: 1440, height: 900 } },
        viewport: { width: 1440, height: 900 },
      }
    : { viewport: { width: 1440, height: 900 } }
);
const page = await context.newPage();

try {
  await page.goto(DEMO_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (useVideo) {
    await page.waitForTimeout(WAIT_MS);
  } else {
    console.log("Playwright ffmpeg not installed — capturing screenshot sequence instead.");
    const shotDir = path.join(ROOT, "docs", "demo-screenshots");
    fs.mkdirSync(shotDir, { recursive: true });
    const interval = 4000;
    const frames = Math.ceil(WAIT_MS / interval);
    for (let i = 0; i < frames; i++) {
      await page.waitForTimeout(interval);
      const file = path.join(shotDir, "frame-" + String(i + 1).padStart(3, "0") + ".png");
      await page.screenshot({ path: file, fullPage: false });
      console.log("  screenshot", file);
    }
  }
} catch (err) {
  console.error("Recording failed:", err.message);
  process.exitCode = 1;
}

await context.close();
await browser.close();

if (!useVideo) {
  console.log("\n✅ Screenshot sequence saved under docs/demo-screenshots/");
  console.log("For a shareable video, either:");
  console.log("  1. Run: npx playwright install ffmpeg  then npm run record-demo");
  console.log("  2. Open /v3?autoplay=1 and record with macOS Screen Recording (⌘⇧5)");
  process.exit(0);
}

function findWebm(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      const nested = findWebm(p);
      if (nested) return nested;
    } else if (ent.name.endsWith(".webm")) {
      return p;
    }
  }
  return null;
}

const src = findWebm(RAW_DIR);
if (!src) {
  console.error("No .webm file found under", RAW_DIR);
  process.exit(1);
}

fs.copyFileSync(src, OUT_FILE);
console.log("\n✅ Demo video saved to:\n   " + OUT_FILE);
console.log("\nShare tip: upload to Teams/SharePoint or convert to MP4 with:");
console.log("   ffmpeg -i docs/Expat_Concierge_V3_Demo.webm docs/Expat_Concierge_V3_Demo.mp4");
