/**
 * Offline demo chat — no external network required.
 * V4: policy-grounded structured answers via v4MobilityPrompt (user context aware).
 */

const express = require("express");
const path = require("path");
const { getUserContext } = require("../services/userContextServiceV2");
const { pickOfflineAnswer } = require("../services/v4MobilityPrompt");

const router = express.Router();

function streamAnswer(res, text) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();
  const words = text.split(/(\s+)/);
  let i = 0;
  const tick = () => {
    if (i >= words.length) {
      res.write(`data: ${JSON.stringify({ done: true, offline: true })}\n\n`);
      res.end();
      return;
    }
    const chunk = words.slice(i, i + 3).join("");
    i += 3;
    res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
    setTimeout(tick, 28);
  };
  tick();
}

router.get("/health", async (_req, res) => {
  const { loadCatalog, catalogPath } = require("../services/offlineQaCatalog");
  const { loadTasks, tasksPath } = require("../services/actionLogTasks");
  const rows = await loadCatalog();
  const tasks = await loadTasks();
  res.json({
    ok: true,
    mode: "offline-demo",
    version: "4.1",
    catalog: { path: catalogPath(), rows: rows.length },
    actionLogTasks: { path: tasksPath(), rows: tasks.length },
  });
});

router.get("/tasks", async (_req, res) => {
  const { loadTasks, tasksPath } = require("../services/actionLogTasks");
  const tasks = await loadTasks();
  if (!tasks.length) {
    return res.status(503).json({
      error: "tasks_not_loaded",
      hint: "Run python3 scripts/export_action_log_tasks_xlsx.py",
      path: tasksPath(),
    });
  }
  res.json({
    version: new Date().toISOString(),
    source: path.basename(tasksPath()),
    tasks,
  });
});

router.post("/chat", async (req, res) => {
  const question = req.body?.question?.trim();
  if (!question) return res.status(400).json({ error: "question is required" });

  const userId = req.body?.userId || null;
  let userContext = userId ? getUserContext(userId) : null;

  if (!userContext) {
    userContext = {
      id: null,
      identity: { name: req.body?.userName || "Guest" },
      permissions: { assignmentType: req.body?.assignmentType || "LTA" },
      corporateContext: {
        hostCountry: req.body?.hostCountry || "",
        homeCountry: req.body?.homeCountry || "",
      },
      profile: {},
    };
  } else {
    userContext.id = userId;
  }

  const answer = await pickOfflineAnswer(question, userContext);
  const stream = req.query.stream === "true";

  if (stream) {
    streamAnswer(res, answer);
  } else {
    res.json({ answer, offline: true });
  }
});

module.exports = router;
