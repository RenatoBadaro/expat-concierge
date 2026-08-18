require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors    = require("cors");
const { describeLLMConfig } = require("./src/services/llmClient");

// ── V2 routes (frozen) ──────────────────────────────────────────────────────────
const askV2Router   = require("./src/routes/askV2");
const usersV2Router = require("./src/routes/usersV2");
const { htmlV2 }    = require("./src/frontend/portalV2");

// ── V3 routes ─────────────────────────────────────────────────────────────────
const askV3Router   = require("./src/routes/askV3");
const askV4Router   = require("./src/routes/askV4");
const askV41Router  = require("./src/routes/askV41");
const askV5Router   = require("./src/routes/askV5");
const demoOfflineRouter = require("./src/routes/demoOffline");
const { describeCopilotConfig } = require("./src/services/copilotChatClient");
// portalV3 kept for reference; /v3 serves the full standalone demo HTML

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "2mb" }));
app.use("/assets", express.static(path.join(ROOT, "assets")));

// ── API ───────────────────────────────────────────────────────────────────────
app.use("/askV2",    askV2Router);
app.use("/v2/users", usersV2Router);
app.use("/askV3",    askV3Router);
app.use("/askV4",    askV4Router);
app.use("/askV41",   askV41Router);
app.use("/askV5",    askV5Router);
app.use("/demo",     demoOfflineRouter);

app.get("/risk-matrix/health", (_req, res) => {
  const p = path.join(ROOT, "data", "risk-matrix.json");
  if (!fs.existsSync(p)) {
    return res.status(503).json({ error: "not_ingested", hint: "Run python3 scripts/ingest_risk_matrix.py" });
  }
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    res.json({
      version: j.version,
      updated: j.updated,
      sourceFile: j.sourceFile,
      tasks: Object.keys(j.tasks || {}).length,
      businessOverridesApplied: j.businessOverridesApplied || 0,
    });
  } catch (e) {
    res.status(500).json({ error: "invalid_json", detail: e.message });
  }
});

// ── Frontend ──────────────────────────────────────────────────────────────────
app.get("/",   (req, res) => res.send(htmlV2()));
app.get("/v2", (req, res) => res.send(htmlV2()));
app.get("/v3", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(ROOT, "expat-concierge-demo-v3.html"));
});
app.get("/v4", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(ROOT, "expat-concierge-demo-v4.html"));
});
app.get("/v41", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(ROOT, "expat-concierge-demo-v4.html"));
});
app.get("/v5", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(ROOT, "expat-concierge-demo-v4.html"));
});
app.use("/docs", express.static(path.join(ROOT, "docs")));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const llm = describeLLMConfig();
  let providerLine;
  if (llm.provider === "azure") {
    providerLine = `Azure OpenAI → ${llm.model} (${llm.endpoint})`;
  } else if (llm.provider === "github") {
    providerLine = `GitHub Models → ${llm.model} (RETIRED — configure AZURE_OPENAI_* in .env)`;
  } else {
    providerLine = "(no LLM — set AZURE_OPENAI_* in .env; GitHub Models retired 2026-07-30)";
  }

  console.log(`\n✅  Expat Concierge running at http://localhost:${PORT}`);
  console.log(`    LLM      : ${providerLine}`);
  console.log(`    V2 (frozen) : http://localhost:${PORT}/v2`);
  console.log(`    V3          : http://localhost:${PORT}/v3`);
  console.log(`    V4 Copilot  : http://localhost:${PORT}/v4`);
  const copilot = describeCopilotConfig();
  if (copilot.configured) {
    console.log(`    Copilot     : M365 Chat API (client ${copilot.clientId.slice(0, 8)}…)`);
  } else {
    console.log(`    Copilot     : set AZURE_CLIENT_ID in .env for V4 MSAL sign-in`);
  }
  console.log(`    LLM health  : http://localhost:${PORT}/askV3/health`);
  console.log(`    Copilot health: http://localhost:${PORT}/askV4/health\n`);
});
