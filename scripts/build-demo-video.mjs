#!/usr/bin/env node
/**
 * Builds a shareable MP4 walkthrough of Expat Concierge V3 (no manual recording).
 * Uses system Chrome for screenshots + Playwright's ffmpeg binary for encoding.
 */

import { chromium } from "playwright";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SHOT_DIR = path.join(ROOT, "docs", "demo-video-slides");
const OUT_MP4 = path.join(ROOT, "docs", "Expat_Concierge_V3_Demo.mp4");
const BASE_URL = process.env.DEMO_BASE_URL || "http://localhost:3000/v3?demo=1";
const FFMPEG =
  process.env.PLAYWRIGHT_FFMPEG ||
  path.join(process.env.HOME || "", "Library/Caches/ms-playwright/ffmpeg-1010/ffmpeg-mac");
const SEC_PER_SLIDE = Number(process.env.SEC_PER_SLIDE || 4);

const execFileAsync = promisify(execFile);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return await chromium.launch({ headless: true, channel: "chrome" });
  }
}

async function shot(page, index, label) {
  const file = path.join(SHOT_DIR, "slide-" + String(index).padStart(2, "0") + ".png");
  await page.screenshot({ path: file, type: "png" });
  console.log("  📸 slide-" + String(index).padStart(2, "0") + " — " + label);
  return file;
}

async function hideDemoOverlay(page) {
  await page.evaluate(() => {
    const ov = document.getElementById("demoOverlay");
    if (ov) ov.classList.add("hidden");
  });
}

async function runJourney(page) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const existing = fs.readdirSync(SHOT_DIR).filter((f) => f.endsWith(".png"));
  existing.forEach((f) => fs.unlinkSync(path.join(SHOT_DIR, f)));

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
  await sleep(1500);
  await hideDemoOverlay(page);

  // 1 — Product overview
  await page.evaluate(() => showPage("overview"));
  await sleep(800);
  await shot(page, 1, "overview");

  // 2 — Users directory
  await page.evaluate(() => showPage("users"));
  await sleep(800);
  await shot(page, 2, "users");

  // 3 — Simulate John Doe → chat
  await page.evaluate(() => simulateUser("u_lta_family"));
  await sleep(1200);
  await shot(page, 3, "chat-profile");

  // 4 — Chat question (housing)
  await page.evaluate(() => {
    if (typeof demoSendMessage === "function") {
      demoSendMessage("What housing support is offered?");
    }
  });
  await sleep(2200);
  await shot(page, 4, "chat-answer");

  // 5 — Action log
  await page.evaluate(() => showPage("actions"));
  await sleep(900);
  await shot(page, 5, "actions");

  // 6 — Complete a task
  await page.evaluate(() => {
    const tasks = getUserTasks(activeUserId);
    const t = tasks.find((x) => x.status === "pending" || x.status === "overdue");
    if (t) toggleTask(t.id);
  });
  await sleep(700);
  await shot(page, 6, "actions-done");

  // 7 — Risk matrix
  await page.evaluate(() => showPage("risk"));
  await sleep(900);
  await shot(page, 7, "risk");

  // 8 — New profile wizard
  await page.evaluate(() => showPage("users"));
  await sleep(400);
  await page.evaluate(() => {
    openProfileWizard();
    document.getElementById("pwName").value = "Elena Martins";
    document.getElementById("pwEmail").value = "elena.martins@company.com";
    document.getElementById("pwType").value = "LTA";
    document.getElementById("pwHome").value = "Brazil";
    document.getElementById("pwHost").value = "United States";
    document.getElementById("pwDept").value = "Marketing";
    document.getElementById("pwPartner").checked = true;
    document.getElementById("pwFirst").checked = true;
  });
  await sleep(500);
  await shot(page, 8, "new-profile");

  // 9 — Save & simulate new user
  await page.evaluate(() => saveProfileWizard());
  await sleep(600);
  const newId = await page.evaluate(() => window.__demoCreatedUserId);
  if (newId) {
    await page.evaluate((id) => simulateUser(id), newId);
    await sleep(1000);
    await shot(page, 9, "new-user-chat");
  }

  // 10 — Benefits question
  await page.evaluate(() => {
    if (typeof demoSendMessage === "function") {
      demoSendMessage("What benefits are offered to me during my assignment?");
    }
  });
  await sleep(2200);
  await shot(page, 10, "benefits");

  // 11 — Journey stepper / header wrap-up
  await page.evaluate(() => showPage("chat"));
  await sleep(600);
  await shot(page, 11, "journey-wrap");
}

async function encodeVideo() {
  const slides = fs
    .readdirSync(SHOT_DIR)
    .filter((f) => /^slide-\d{2}\.png$/.test(f))
    .sort();
  if (!slides.length) throw new Error("No slides captured");

  if (fs.existsSync(FFMPEG)) {
    const pattern = path.join(SHOT_DIR, "slide-%02d.png");
    try {
      await execFileAsync(FFMPEG, [
        "-y",
        "-framerate",
        String(1 / SEC_PER_SLIDE),
        "-i",
        pattern,
        "-vf",
        "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:color=white",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        OUT_MP4,
      ]);
      return;
    } catch (e) {
      console.log("Playwright ffmpeg failed, using Python imageio…", e.message);
    }
  }

  const pyScript = path.join(ROOT, "scripts", "encode-demo-slides.py");
  await execFileAsync("python3", [pyScript], { env: { ...process.env, SEC_PER_SLIDE: String(SEC_PER_SLIDE) } });
}

console.log("Building demo video from:", BASE_URL);

const browser = await launchBrowser();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  await runJourney(page);
  await context.close();
  await browser.close();
  await encodeVideo();
  const sizeMb = (fs.statSync(OUT_MP4).size / (1024 * 1024)).toFixed(1);
  console.log("\n✅ Video ready:", OUT_MP4, "(" + sizeMb + " MB)");
} catch (err) {
  console.error("Failed:", err.message);
  await browser.close();
  process.exit(1);
}
