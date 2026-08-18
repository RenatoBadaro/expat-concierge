/**
 * V4.1 shared-provider chat.
 * No browser token is required: the provider credential remains server-side.
 */

const express = require("express");
const { getUserContext } = require("../services/userContextServiceV2");
const { checkPolicyAccess, checkQuestionScope } = require("../services/policyAccessControlV2");
const { buildCopilotInstructions } = require("../services/v4MobilityPrompt");
const { createSharedAIClient, describeSharedAIConfig } = require("../services/sharedAiClient");

const router = express.Router();
const sessions = new Map();
const SESSION_TTL = 2 * 60 * 60 * 1000;
const MAX_HISTORY = 20;

function getSession(userId, sessionId) {
  const key = `v41::${userId || "anon"}::${sessionId || "default"}`;
  const found = sessions.get(key);
  if (found) { found.lastActive = Date.now(); return found; }
  const fresh = { history: [], lastActive: Date.now() };
  sessions.set(key, fresh);
  return fresh;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL) sessions.delete(key);
  }
}, 30 * 60 * 1000);

function buildMessages(question, userContext, history) {
  const messages = [
    { role: "system", content: buildCopilotInstructions(userContext) },
    ...history.flatMap((turn) => [
      { role: "user", content: turn.user },
      { role: "assistant", content: turn.assistant },
    ]),
    { role: "user", content: question },
  ];
  return messages;
}

router.get("/health", (_req, res) => {
  res.json({ version: "4.1", mode: "shared-provider", ai: describeSharedAIConfig() });
});

router.post("/", async (req, res) => {
  const question = req.body?.question?.trim();
  const userId = req.body?.userId || null;
  const sessionId = req.body?.sessionId || req.headers["x-session-id"] || null;
  const useStream = req.query.stream === "true";

  if (!question) return res.status(400).json({ error: "question is required." });

  const userContext = getUserContext(userId);
  if (!userContext) return res.status(403).json({ error: "User not found or not authorized.", userId });

  const access = checkPolicyAccess(userContext);
  if (!access.allowed) return res.status(403).json({ error: access.reason });

  const scopeCheck = checkQuestionScope(question, userContext);
  if (!scopeCheck.inScope) {
    return res.status(403).json({ error: "out_of_scope", answer: scopeCheck.violation });
  }

  let ai;
  try { ai = createSharedAIClient(); }
  catch (err) { return res.status(503).json({ error: "shared_provider_not_configured", detail: err.message }); }

  const session = getSession(userId, sessionId);
  const messages = buildMessages(question, userContext, session.history);

  try {
    const stream = await ai.client.chat.completions.create({
      model: ai.model,
      messages,
      temperature: 0.35,
      max_tokens: 4096,
      stream: useStream,
    });

    if (!useStream) {
      const answer = stream.choices?.[0]?.message?.content || "";
      session.history.push({ user: question, assistant: answer });
      if (session.history.length > MAX_HISTORY) session.history.shift();
      return res.json({ version: "4.1", provider: ai.provider, answer });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();
    let fullResponse = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
    session.history.push({ user: question, assistant: fullResponse });
    if (session.history.length > MAX_HISTORY) session.history.shift();
    res.write(`data: ${JSON.stringify({ done: true, provider: ai.provider })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[V4.1] Shared provider error:", err.message);
    if (!res.headersSent) res.status(err.status || 502).json({ error: "shared_provider_error", detail: err.message });
    else { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  }
});

module.exports = router;
