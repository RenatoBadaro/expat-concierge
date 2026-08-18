/**
 * V3 Ask Route — Orchestrator (evolves V2; V2 route unchanged)
 *
 * Same pipeline as V2 but uses buildSystemPromptV3 (policy citations,
 * assertiveness, escalation prohibition, host-country flags).
 */

const express  = require("express");
const OpenAI   = require("openai");

const { getUserContext }                                   = require("../services/userContextServiceV2");
const { checkPolicyAccess, filterChunksByPolicy,
        buildRetrievalOptions, checkQuestionScope }        = require("../services/policyAccessControlV2");
const { analyze }                                          = require("../services/decisionEngineV2");
const { score }                                            = require("../services/confidenceEngineV2");
const { buildSystemPromptV3 }                              = require("../prompts/systemV3");
const { retrieveRelevantChunks }                           = require("../services/retrieval");
const { getPolicies }                                      = require("../services/policyStore");
const { route: routeToAgent }                              = require("../agents/v2/policyAgentRouterV2");
const { validateSpecialistOutput, buildChatContext }       = require("../agents/v2/chatAgentV2");
const { audit }                                            = require("../services/auditLoggerV2");

const router = express.Router();

const sessions    = new Map();
const SESSION_TTL = 2 * 60 * 60 * 1000;
const MAX_HISTORY = 20;

function sessionKey(userId, sessionId) {
  return `v3::${userId || "anon"}::${sessionId || "default"}`;
}

function getSession(userId, sessionId) {
  const key   = sessionKey(userId, sessionId);
  const found = sessions.get(key);
  if (found) { found.lastActive = Date.now(); return found; }
  const fresh = { history: [], lastActive: Date.now() };
  sessions.set(key, fresh);
  return fresh;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(k);
  }
}, 30 * 60 * 1000);

const { createLLMClient, describeLLMConfig, isGitHubRetirementError, GITHUB_MODELS_RETIRED_MSG } = require("../services/llmClient");

function buildMessages(systemPrompt, question, policyContext, history) {
  const messages = [{ role: "system", content: systemPrompt }];
  for (const turn of history) {
    messages.push({ role: "user",      content: turn.user });
    messages.push({ role: "assistant", content: turn.assistant });
  }
  const ctx = policyContext ? `\n\n${policyContext}` : "";
  messages.push({ role: "user", content: question + ctx });
  return messages;
}

router.get("/health", (_req, res) => {
  res.json({ version: "3.0", llm: describeLLMConfig() });
});

router.post("/", async (req, res) => {
  const question  = req.body?.question?.trim();
  const userId    = req.body?.userId    || null;
  const sessionId = req.body?.sessionId || req.headers["x-session-id"] || null;
  const useStream = req.query.stream === "true";

  if (!question) return res.status(400).json({ error: "question is required." });

  const userContext = getUserContext(userId);
  if (!userContext) {
    return res.status(403).json({ error: "User not found or not authorized.", userId });
  }

  const access = checkPolicyAccess(userContext);
  if (!access.allowed) return res.status(403).json({ error: access.reason });

  const scopeCheck = checkQuestionScope(question, userContext);
  if (!scopeCheck.inScope) {
    return res.status(403).json({
      error: "out_of_scope",
      answer: scopeCheck.violation,
      assignmentType: userContext.permissions.assignmentType,
    });
  }

  const allPolicies = getPolicies();
  const retrievalOpts = buildRetrievalOptions(userContext);
  let chunks = [];

  if (allPolicies.length > 0) {
    try {
      const query = `${retrievalOpts.assignmentType} ${question}`;
      const raw   = await retrieveRelevantChunks(query, 12);
      chunks      = filterChunksByPolicy(raw, userContext);
    } catch (e) {
      console.warn("[V3] Retrieval warning:", e.message);
    }
  }

  let specialistOutput = routeToAgent(question, chunks, userContext);

  const validation = validateSpecialistOutput(specialistOutput, userContext);
  let fallbackUsed = false;
  if (!validation.valid) {
    console.warn("[V3] Specialist output invalid:", validation.reason, "— using generic fallback");
    const genericAgent = require("../agents/v2/genericPolicyAgentV2");
    specialistOutput   = genericAgent.run(question, chunks, userContext);
    fallbackUsed       = true;
  }

  const decision = analyze(question, chunks, userContext, specialistOutput);
  const { confidence, riskLevel, signals } = score(chunks, decision, userContext, specialistOutput);

  const systemPrompt = buildSystemPromptV3(userContext);

  let policyContext = "";
  if (allPolicies.length === 0) {
    policyContext =
      "[CONTEXT: No policies indexed. Use embedded V3 policy knowledge from skills. Do NOT default to vague market practice.]";
  } else if (chunks.length > 0) {
    const header = `[Active assignment type: ${retrievalOpts.assignmentType}]\n[Authorized policies: ${retrievalOpts.allowedPolicies.join(", ")}]\n`;
    policyContext =
      header +
      "--- Relevant Policy Context ---\n" +
      chunks.join("\n\n---\n\n") +
      "\n--- End of Policy Context ---";
  } else {
    policyContext =
      `[Assignment type: ${retrievalOpts.assignmentType}. ` +
      "No retrieved chunks — use embedded policy knowledge from system prompt and skills.]";
  }

  policyContext += "\n\n" + buildChatContext(specialistOutput, decision, confidence, riskLevel);

  const session = getSession(userId, sessionId);

  const meta = {
    version:            "3.0",
    userId,
    userName:           userContext.identity.name,
    assignmentType:     userContext.permissions.assignmentType,
    policiesUsed:       retrievalOpts.allowedPolicies,
    chunksRetrieved:    chunks.length,
    confidence,
    riskLevel,
    decisionType:       decision.decisionType,
    escalationRequired: decision.escalationRequired,
    escalationTeam:     decision.escalationTeam || null,
    missingInformation: decision.missingInformation,
    selectedPolicyAgent: specialistOutput.agent,
    fallbackUsed,
  };

  audit({
    userId,
    userName:            userContext.identity.name,
    assignmentType:      userContext.permissions.assignmentType,
    question,
    selectedPolicyAgent: specialistOutput.agent,
    policyType:          specialistOutput.policyType,
    eligibilitySignal:   specialistOutput.eligibilitySignal,
    decisionType:        decision.decisionType,
    confidence,
    riskLevel,
    riskFlags:           specialistOutput.riskFlags,
    escalationRequired:  decision.escalationRequired,
    escalationTeam:      decision.escalationTeam || null,
    missingInformation:  decision.missingInformation,
    fallbackUsed,
    scopedPoliciesUsed:  retrievalOpts.allowedPolicies,
    chunksRetrieved:     chunks.length,
    warnings:            signals.filter((s) => s.startsWith("Risk:")),
  });

  let llmClient, llmModel;
  try {
    const c = createLLMClient();
    llmClient = c.client;
    llmModel  = c.model;
  } catch (err) {
    return res.status(500).json({ error: "LLM provider not configured.", detail: err.message });
  }

  const messages = buildMessages(systemPrompt, question, policyContext, session.history);

  if (useStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    let fullResponse = "";
    try {
      const stream = await llmClient.chat.completions.create({
        model:       llmModel,
        temperature: 0.35,
        max_tokens:  4096,
        stream:      true,
        messages,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      if (sessionId || userId) {
        session.history.push({ user: question, assistant: fullResponse });
        if (session.history.length > MAX_HISTORY) session.history.shift();
      }

      res.write(`data: ${JSON.stringify({ done: true, meta })}\n\n`);
    } catch (err) {
      console.error("[V3] Stream error:", err.message);
      const detail = isGitHubRetirementError(err) ? GITHUB_MODELS_RETIRED_MSG : err.message;
      res.write(`data: ${JSON.stringify({ error: detail })}\n\n`);
    } finally {
      res.end();
    }
  } else {
    try {
      const response = await llmClient.chat.completions.create({
        model:       llmModel,
        temperature: 0.35,
        max_tokens:  4096,
        messages,
      });
      const answer = response.choices[0].message.content ?? "";

      if (sessionId || userId) {
        session.history.push({ user: question, assistant: answer });
        if (session.history.length > MAX_HISTORY) session.history.shift();
      }

      res.json({ answer, ...meta });
    } catch (err) {
      console.error("[V3] LLM error:", err.message);
      const detail = isGitHubRetirementError(err) ? GITHUB_MODELS_RETIRED_MSG : err.message;
      res.status(500).json({ error: "LLM call failed.", detail });
    }
  }
});

module.exports = router;
