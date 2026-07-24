require("dotenv").config();

const express = require("express");
const cors    = require("cors");

// ── V2 routes ─────────────────────────────────────────────────────────────────
const askV2Router   = require("./src/routes/askV2");
const usersV2Router = require("./src/routes/usersV2");
const { htmlV2 }    = require("./src/frontend/portalV2");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "2mb" }));

// ── API ───────────────────────────────────────────────────────────────────────
app.use("/askV2",    askV2Router);
app.use("/v2/users", usersV2Router);

// ── Frontend ──────────────────────────────────────────────────────────────────
app.get("/",   (req, res) => res.send(htmlV2()));
app.get("/v2", (req, res) => res.send(htmlV2()));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const provider = process.env.GITHUB_TOKEN
    ? `GitHub Models → ${process.env.GITHUB_MODEL || "gpt-4o"}`
    : process.env.AZURE_OPENAI_DEPLOYMENT
      ? `Azure OpenAI  → ${process.env.AZURE_OPENAI_DEPLOYMENT}`
      : "(no LLM provider — set GITHUB_TOKEN or AZURE_OPENAI_* in .env)";

  console.log(`\n✅  Expat Concierge V2 running at http://localhost:${PORT}`);
  console.log(`    Provider : ${provider}`);
  console.log(`    Portal   : http://localhost:${PORT}/\n`);
});
