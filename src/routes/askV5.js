/** V5 provider-agnostic route: orchestrator first, provider second. */

const express = require("express");
const { getUserContext } = require("../services/userContextServiceV2");
const { runPolicyPipeline } = require("../services/conciergeOrchestratorV5");
const { createSharedAIClient, describeSharedAIConfig } = require("../services/sharedAiClient");
const {
  describeCopilotConfig, createConversation, chatOverStream, chatSync,
  extractLatestBotText, parseGraphSseStream,
} = require("../services/copilotChatClient");

const router = express.Router();
const sessions = new Map();
const SESSION_TTL = 2 * 60 * 60 * 1000;
const MAX_HISTORY = 20;

function sessionKey(provider, userId, sessionId) {
  return `v5::${provider}::${userId || "anon"}::${sessionId || "default"}`;
}

function getSession(provider, userId, sessionId) {
  const key = sessionKey(provider, userId, sessionId);
  const found = sessions.get(key);
  if (found) { found.lastActive = Date.now(); return found; }
  const fresh = { conversationId: null, history: [], lastActive: Date.now() };
  sessions.set(key, fresh);
  return fresh;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL) sessions.delete(key);
  }
}, 30 * 60 * 1000);

function bearer(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : null;
}

function providerFor(req) {
  return String(req.body?.provider || req.query.provider || process.env.V5_PROVIDER || "shared").toLowerCase();
}

function sharedMessages(pipeline, question, history) {
  return [
    { role: "system", content: `${pipeline.instructions}\n\n${pipeline.orchestrationContext}` },
    ...history.flatMap((turn) => [
      { role: "user", content: turn.user },
      { role: "assistant", content: turn.assistant },
    ]),
    { role: "user", content: question },
  ];
}

function copilotBody(pipeline, question, timeZone) {
  return {
    message: {
      text: [
        "Respond as the ABI Global Mobility Concierge.",
        question,
        "Use the mandatory Answer / What this means / Next steps / Policy reference format.",
      ].join("\n\n"),
    },
    locationHint: { timeZone: timeZone || process.env.COPILOT_TIMEZONE || "America/Sao_Paulo" },
    additionalContext: [{
      description: "V5 policy agent, decision engine, confidence engine, assignee profile, and policy skills",
      text: `${pipeline.instructions}\n\n${pipeline.orchestrationContext}`,
    }],
    contextualResources: { webContext: { isWebEnabled: false } },
  };
}

router.get("/health", (_req, res) => {
  res.json({
    version: "5.0",
    orchestrator: {
      enabled: true,
      stages: ["policy-agent-v2/v3", "decision-engine-v2", "confidence-engine-v2", "provider"],
    },
    experience: {
      actions: { enabled: true, source: "/assets/action-log-tasks-v4.json" },
      riskMatrix: { enabled: true, source: "/assets/risk-matrix.json", health: "/risk-matrix/health" },
    },
    providers: { shared: describeSharedAIConfig(), copilot: describeCopilotConfig() },
  });
});

router.post("/", async (req, res) => {
  const question = req.body?.question?.trim();
  const userId = req.body?.userId || null;
  const sessionId = req.body?.sessionId || req.headers["x-session-id"] || null;
  const useStream = req.query.stream === "true";
  const provider = providerFor(req);
  if (!question) return res.status(400).json({ error: "question is required." });

  const userContext = getUserContext(userId);
  if (!userContext) return res.status(403).json({ error: "User not found or not authorized.", userId });

  const pipeline = await runPolicyPipeline(question, { ...userContext, id: userId });
  if (!pipeline.ok) return res.status(pipeline.status).json(pipeline);
  const session = getSession(provider, userId, sessionId);

  if (provider === "copilot") {
    const token = bearer(req);
    if (!token) return res.status(401).json({ error: "missing_token", detail: "Bearer Copilot token required." });
    try {
      if (!session.conversationId) session.conversationId = (await createConversation(token)).id;
      const body = copilotBody(pipeline, question, req.body?.timeZone);
      if (useStream) {
        const graphRes = await chatOverStream(token, session.conversationId, body);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.flushHeaders();
        let lastText = "";
        for await (const event of parseGraphSseStream(graphRes.body)) {
          const text = extractLatestBotText(event);
          if (!text || text === lastText) continue;
          const delta = text.startsWith(lastText) ? text.slice(lastText.length) : text;
          lastText = text;
          if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true, provider: "m365-copilot", meta: pipeline.meta })}\n\n`);
        return res.end();
      }
      const conversation = await chatSync(token, session.conversationId, body);
      return res.json({ version: "5.0", provider: "m365-copilot", answer: extractLatestBotText(conversation), meta: pipeline.meta });
    } catch (err) {
      return res.status(err.status || 502).json({ error: "copilot_provider_error", detail: err.detail || err.message, meta: pipeline.meta });
    }
  }

  let ai;
  try { ai = createSharedAIClient(); }
  catch (err) { return res.status(503).json({ error: "shared_provider_not_configured", detail: err.message, meta: pipeline.meta }); }

  try {
    const completion = await ai.client.chat.completions.create({
      model: ai.model,
      messages: sharedMessages(pipeline, question, session.history),
      temperature: 0.35,
      max_tokens: 4096,
      stream: useStream,
    });
    if (!useStream) {
      const answer = completion.choices?.[0]?.message?.content || "";
      session.history.push({ user: question, assistant: answer });
      if (session.history.length > MAX_HISTORY) session.history.shift();
      return res.json({ version: "5.0", provider: ai.provider, answer, meta: pipeline.meta });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();
    let full = "";
    for await (const chunk of completion) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) { full += delta; res.write(`data: ${JSON.stringify({ delta })}\n\n`); }
    }
    session.history.push({ user: question, assistant: full });
    if (session.history.length > MAX_HISTORY) session.history.shift();
    res.write(`data: ${JSON.stringify({ done: true, provider: ai.provider, meta: pipeline.meta })}\n\n`);
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(err.status || 502).json({ error: "shared_provider_error", detail: err.message, meta: pipeline.meta });
    else { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  }
});

module.exports = router;
