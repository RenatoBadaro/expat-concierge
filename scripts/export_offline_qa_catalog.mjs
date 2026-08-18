#!/usr/bin/env node
/**
 * Export offline Q&A catalog (V4) as JSON for Excel generation.
 * Source: src/services/v4MobilityPrompt.js → pickOfflineAnswer()
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const { legacyPickOfflineAnswer } = require(join(ROOT, "src/services/v4MobilityPrompt.js"));
const { getUserContext } = require(join(ROOT, "src/services/userContextServiceV2.js"));

const CATALOG = [
  { id: "01", topic: "Greeting", keywords: "hi, hello, hey, olá", question: "Hello" },
  // Normalize keywords in Excel for AND/OR matching (see offlineQaCatalog.js)
  { id: "02", topic: "Need more — housing", keywords: "need more/what if/top up + housing/rent/apartment", question: "What if I need more for my apartment rent?" },
  { id: "03", topic: "Need more — generic", keywords: "need more, what if, exceed, additional", question: "What if I need more?" },
  { id: "04", topic: "Expatriation journey", keywords: "step, process, expatriation, journey", question: "What are the key steps in my expatriation process?" },
  { id: "05", topic: "Benefits package", keywords: "benefit, package, allowance", question: "What benefits are offered to me during my assignment?" },
  { id: "06", topic: "Look & See", keywords: "look, see, book + ticket", question: "What can I expect from my Look & See visit?" },
  { id: "07", topic: "Housing subsidy", keywords: "housing, rent, subsidy, apartment", question: "What housing support is offered?" },
  { id: "08", topic: "Education — US host", keywords: "education, schooling, school, childcare", question: "What's the education support for me?", userId: "u_lta_family" },
  { id: "09", topic: "Education — non-US host", keywords: "education, schooling, school", question: "What's the education support for me?", userId: "u_ia_complex" },
  { id: "10", topic: "Pets", keywords: "pet, dog, cat (word boundary)", question: "Can I bring my dog on the assignment?" },
  { id: "11", topic: "Partner / spouse", keywords: "spouse, partner, wife, husband", question: "What support is available for my spouse?" },
  { id: "12", topic: "Bonus / tax / equity", keywords: "bonus, tax, rsu, equity", question: "How are my bonus and RSU taxed during assignment?" },
  { id: "13", topic: "Immigration", keywords: "immigration, visa, work permit, document", question: "What immigration documents do I need to prepare?" },
  { id: "14", topic: "Household goods / shipment", keywords: "container, shipment, hhg, household, furniture", question: "What container size am I entitled to for household goods?" },
  { id: "15", topic: "Home leave", keywords: "home leave, vacation, visit home, fly home", question: "How does home leave work during my assignment?" },
  { id: "16", topic: "Temporary living", keywords: "temp, temporary living, hotel", question: "What is temporary living and how long is it covered?" },
  { id: "17", topic: "Language training", keywords: "language, cultural", question: "What language training am I entitled to?" },
  { id: "18", topic: "Integration allowance", keywords: "integration", question: "What is the integration allowance and what can I use it for?" },
  { id: "19", topic: "Fallback (unmatched)", keywords: "(any other question)", question: "Can you help me understand my relocation package in general?" },
];

function splitResponse(full) {
  const idx = full.indexOf("\n---\n");
  if (idx === -1) return { body: full.trim(), followups: [] };
  const body = full.slice(0, idx).trim();
  const followups = full
    .slice(idx + 5)
    .split("\n")
    .map((l) => l.replace(/^\?\?\s*/, "").trim())
    .filter(Boolean);
  return { body, followups };
}

function profileLabel(ctx) {
  if (!ctx) return "";
  const cc = ctx.corporateContext || {};
  const perm = ctx.permissions || {};
  return `${ctx.identity?.name || "?"} (${perm.assignmentType} · ${cc.homeCountry} → ${cc.hostCountry})`;
}

const defaultUserId = "u_lta_family";
const rows = [];

for (const item of CATALOG) {
  const userId = item.userId || defaultUserId;
  const ctx = getUserContext(userId);
  const full = legacyPickOfflineAnswer(item.question, { ...ctx, id: userId });
  const { body, followups } = splitResponse(full);

  rows.push({
    id: item.id,
    topic: item.topic,
    keywords: item.keywords,
    sampleQuestion: item.question,
    userId,
    profile: profileLabel(ctx),
    assignmentType: ctx?.permissions?.assignmentType || "",
    hostCountry: ctx?.corporateContext?.hostCountry || "",
    fullResponse: body,
    followUp1: followups[0] || "",
    followUp2: followups[1] || "",
    followUp3: followups[2] || "",
    validationStatus: "To review",
    notes: "",
  });
}

const outPath = join(ROOT, "docs/offline-qa-catalog-v4.json");
writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), version: "V4 offline", rows }, null, 2));
console.log(`Wrote ${rows.length} rows → ${outPath}`);
