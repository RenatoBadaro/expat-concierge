/**
 * V2 Ask Route — Orchestrator
 *
 * Flow:
 *   request → getUserContext → checkPolicyAccess → scoped retrieval
 *   → decisionEngine → confidenceEngine → buildSystemPromptV2
 *   → LLM (stream or JSON) → structured response
 */

const express  = require("express");
const https    = require("https");
const OpenAI   = require("openai");

const { getUserContext }                                   = require("../services/userContextServiceV2");
const { checkPolicyAccess, filterChunksByPolicy,
        buildRetrievalOptions, getEscalationTarget,
        checkQuestionScope }                               = require("../services/policyAccessControlV2");
const { analyze }                                          = require("../services/decisionEngineV2");
const { score }                                            = require("../services/confidenceEngineV2");
const { buildSystemPromptV2 }                              = require("../prompts/systemV2");
const { retrieveRelevantChunks }                           = require("../services/retrieval");
const { getPolicies }                                      = require("../services/policyStore");
const { route: routeToAgent }                              = require("../agents/v2/policyAgentRouterV2");
const { validateSpecialistOutput, buildChatContext }       = require("../agents/v2/chatAgentV2");
const { audit }                                            = require("../services/auditLoggerV2");

const router = express.Router();

// ── Session store (V2 — keyed by userId + sessionId) ────────────────────────
const sessions    = new Map();
const SESSION_TTL = 2 * 60 * 60 * 1000;
const MAX_HISTORY = 20;

function sessionKey(userId, sessionId) {
  return `${userId || "anon"}::${sessionId || "default"}`;
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

// ── LLM client (reuses env config from V1) ──────────────────────────────────
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function createLLMClient() {
  const provider = (process.env.PROVIDER || "").toLowerCase();
  const useGitHub =
    provider === "github" ||
    (!provider && process.env.GITHUB_TOKEN && !process.env.AZURE_OPENAI_KEY);

  if (useGitHub) {
    return {
      client: new OpenAI({
        apiKey:    process.env.GITHUB_TOKEN,
        baseURL:   "https://models.inference.ai.azure.com",
        httpAgent: httpsAgent,
      }),
      model: process.env.GITHUB_MODEL || "gpt-4o",
    };
  }

  return {
    client: new OpenAI({
      apiKey:         process.env.AZURE_OPENAI_KEY,
      baseURL:        `${(process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/$/, "")}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery:   { "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview" },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
      httpAgent:      httpsAgent,
    }),
    model: process.env.AZURE_OPENAI_DEPLOYMENT,
  };
}

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

// ── POST /askV2 ──────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const question  = req.body?.question?.trim();
  const userId    = req.body?.userId    || null;
  const sessionId = req.body?.sessionId || req.headers["x-session-id"] || null;
  const useStream = req.query.stream === "true";

  if (!question) return res.status(400).json({ error: "question is required." });

  // ── 1. Get user context ────────────────────────────────────────────────────
  const userContext = getUserContext(userId);
  if (!userContext) {
    return res.status(403).json({
      error: "User not found or not authorized.",
      userId,
    });
  }

  // ── 2. Policy access check ────────────────────────────────────────────────
  const access = checkPolicyAccess(userContext);
  if (!access.allowed) {
    return res.status(403).json({ error: access.reason });
  }

  // ── 2b. Question scope guard — hard block cross-assignment questions ───────
  const scopeCheck = checkQuestionScope(question, userContext);
  if (!scopeCheck.inScope) {
    return res.status(403).json({
      error: "out_of_scope",
      answer: scopeCheck.violation,
      assignmentType: userContext.permissions.assignmentType,
    });
  }

  // ── 3. Scoped retrieval ───────────────────────────────────────────────────
  const allPolicies = getPolicies();
  const retrievalOpts = buildRetrievalOptions(userContext);
  let chunks = [];

  if (allPolicies.length > 0) {
    try {
      const query = `${retrievalOpts.assignmentType} ${question}`;
      const raw   = await retrieveRelevantChunks(query, 12);
      chunks      = filterChunksByPolicy(raw, userContext);
    } catch (e) {
      console.warn("[V2] Retrieval warning:", e.message);
    }
  }

  // ── 4. Route to Policy Specialist Agent ──────────────────────────────────
  let specialistOutput = routeToAgent(question, chunks, userContext);

  // Validate specialist output — fall back to generic if invalid
  const validation = validateSpecialistOutput(specialistOutput, userContext);
  let fallbackUsed = false;
  if (!validation.valid) {
    console.warn("[V2] Specialist output invalid:", validation.reason, "— using generic fallback");
    const genericAgent = require("../agents/v2/genericPolicyAgentV2");
    specialistOutput   = genericAgent.run(question, chunks, userContext);
    fallbackUsed       = true;
  }

  // ── 5. Decision engine (now specialist-aware) ─────────────────────────────
  const decision = analyze(question, chunks, userContext, specialistOutput);

  // ── 6. Confidence engine (now specialist-aware) ───────────────────────────
  const { confidence, riskLevel, signals } = score(chunks, decision, userContext, specialistOutput);

  // ── 7. Build personalized system prompt ──────────────────────────────────
  const systemPrompt = buildSystemPromptV2(userContext);

  // ── 8. Build policy context block ────────────────────────────────────────
  let policyContext   = "";

  if (allPolicies.length === 0) {
    policyContext =
      "[CONTEXT: No policies have been indexed yet. Answer based on general market practice and recommend confirming with Global Mobility.]";
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
      "No specific policy content found for this question. " +
      "Answer based on general practice, clearly noting it is market practice and not internal policy.]";
  }

  // Append specialist agent + engine context
  policyContext += "\n\n" + buildChatContext(specialistOutput, decision, confidence, riskLevel);

  // ── 9. Session history ────────────────────────────────────────────────────
  const session = getSession(userId, sessionId);

  // ── 10. Metadata payload + audit ─────────────────────────────────────────
  const meta = {
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

  // ── 10. LLM call ──────────────────────────────────────────────────────────
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
        temperature: 0.4,
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
      console.error("[V2] Stream error:", err.message);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
      res.end();
    }
  } else {
    try {
      const response = await llmClient.chat.completions.create({
        model:       llmModel,
        temperature: 0.4,
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
      console.error("[V2] LLM error:", err.message);
      res.status(500).json({ error: "LLM call failed.", detail: err.message });
    }
  }
});

module.exports = router;
