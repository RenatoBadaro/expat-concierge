/**
 * V4 Ask Route — Microsoft 365 Copilot Chat API (Graph beta).
 * User's Graph token (MSAL) is required on every request.
 */

const express = require("express");
const { getUserContext } = require("../services/userContextServiceV2");
const { checkPolicyAccess, checkQuestionScope } = require("../services/policyAccessControlV2");
const {
  describeCopilotConfig,
  createConversation,
  chatOverStream,
  chatSync,
  extractLatestBotText,
  parseGraphSseStream,
} = require("../services/copilotChatClient");
const { buildCopilotInstructions } = require("../services/v4MobilityPrompt");

const router = express.Router();

const sessions = new Map();
const SESSION_TTL = 2 * 60 * 60 * 1000;

function sessionKey(userId, sessionId) {
  return `v4::${userId || "anon"}::${sessionId || "default"}`;
}

function getSession(userId, sessionId) {
  const key = sessionKey(userId, sessionId);
  const found = sessions.get(key);
  if (found) {
    found.lastActive = Date.now();
    return found;
  }
  const fresh = { conversationId: null, lastActive: Date.now() };
  sessions.set(key, fresh);
  return fresh;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(k);
  }
}, 30 * 60 * 1000);

function extractBearer(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  return null;
}

function buildChatPayload(question, userContext, timeZone) {
  const instructions = buildCopilotInstructions(userContext);
  const assignmentType = userContext?.permissions?.assignmentType || "LTA";
  const host = userContext?.corporateContext?.hostCountry || "unknown";
  const framedQuestion = [
    `[Assignee question — ${assignmentType} assignment, host: ${host}]`,
    question,
    "",
    "Respond as the ABI Global Mobility Concierge using the policy rules and profile in additionalContext.",
    "Use the mandatory response format (Answer / What this means / Next steps / Policy reference).",
    "Be warm, specific, and policy-grounded — not brief or generic.",
  ].join("\n");

  return {
    message: {
      text: framedQuestion,
    },
    locationHint: {
      timeZone: timeZone || process.env.COPILOT_TIMEZONE || "America/Sao_Paulo",
    },
    additionalContext: [
      {
        description: "ABI Global Mobility concierge rules, assignee profile, and policy knowledge",
        text: instructions,
      },
    ],
    contextualResources: {
      webContext: { isWebEnabled: false },
    },
  };
}

function mapCopilotError(err) {
  const status = err.status || 500;
  const detail = err.detail || err.message;
  if (status === 401) {
    return { status: 401, error: "copilot_auth", detail: "Graph token expired or invalid. Sign in again." };
  }
  if (status === 403) {
    return {
      status: 403,
      error: "copilot_forbidden",
      detail: detail || "Missing Copilot license or Graph permissions. Admin consent may be required.",
    };
  }
  if (detail && /copilot/i.test(detail)) {
    return { status: status, error: "copilot_api", detail };
  }
  return { status: status >= 400 ? status : 500, error: "copilot_api", detail };
}

router.get("/health", (_req, res) => {
  res.json({ version: "4.0", copilot: describeCopilotConfig() });
});

router.get("/config", (_req, res) => {
  const cfg = describeCopilotConfig();
  if (!cfg.configured) {
    return res.status(503).json({
      error: "not_configured",
      message: "Set AZURE_CLIENT_ID (Entra app registration) in .env for MSAL sign-in.",
      copilot: cfg,
    });
  }
  res.json({
    clientId: cfg.clientId,
    tenantId: cfg.tenantId,
    scopes: cfg.scopes,
    redirectUri: process.env.AZURE_REDIRECT_URI || null,
    authority: `https://login.microsoftonline.com/${cfg.tenantId}`,
  });
});

router.post("/", async (req, res) => {
  const accessToken = extractBearer(req);
  if (!accessToken) {
    return res.status(401).json({ error: "missing_token", detail: "Authorization: Bearer <Graph token> required." });
  }

  const question = req.body?.question?.trim();
  const userId = req.body?.userId || null;
  const sessionId = req.body?.sessionId || req.headers["x-session-id"] || null;
  const timeZone = req.body?.timeZone || null;
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

  const session = getSession(userId, sessionId);
  const chatBody = buildChatPayload(question, userContext, timeZone);

  try {
    if (!session.conversationId) {
      const created = await createConversation(accessToken);
      session.conversationId = created.id;
    }

    if (useStream) {
      const graphRes = await chatOverStream(accessToken, session.conversationId, chatBody);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.flushHeaders();

      let lastText = "";
      try {
        for await (const event of parseGraphSseStream(graphRes.body)) {
          const text = extractLatestBotText(event);
          if (!text || text === lastText) continue;
          const delta = text.startsWith(lastText) ? text.slice(lastText.length) : text;
          lastText = text;
          if (delta) {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true, conversationId: session.conversationId })}\n\n`);
        res.end();
      } catch (streamErr) {
        const mapped = mapCopilotError(streamErr);
        res.write(`data: ${JSON.stringify({ error: mapped.detail })}\n\n`);
        res.end();
      }
      return;
    }

    const conversation = await chatSync(accessToken, session.conversationId, chatBody);
    const answer = extractLatestBotText(conversation);
    res.json({
      version: "4.0",
      provider: "m365-copilot",
      conversationId: session.conversationId,
      answer,
      userName: userContext.identity.name,
      assignmentType: userContext.permissions.assignmentType,
    });
  } catch (err) {
    const mapped = mapCopilotError(err);
    console.error("[V4] Copilot error:", mapped.detail);
    res.status(mapped.status).json({ error: mapped.error, detail: mapped.detail });
  }
});

module.exports = router;
