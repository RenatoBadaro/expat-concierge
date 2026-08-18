/**
 * Microsoft 365 Copilot Chat API (Graph beta).
 * https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/overview
 */

const GRAPH_BETA = "https://graph.microsoft.com/beta";

const COPILOT_CHAT_SCOPES = [
  "Sites.Read.All",
  "Mail.Read",
  "People.Read.All",
  "OnlineMeetingTranscript.Read.All",
  "Chat.Read",
  "ChannelMessage.Read.All",
  "ExternalItem.Read.All",
];

function getCopilotConfig() {
  return {
    clientId: process.env.AZURE_CLIENT_ID || "",
    tenantId: process.env.AZURE_TENANT_ID || "organizations",
    scopes: COPILOT_CHAT_SCOPES,
    graphHost: GRAPH_BETA,
  };
}

function describeCopilotConfig() {
  const cfg = getCopilotConfig();
  return {
    provider: "m365-copilot",
    configured: Boolean(cfg.clientId),
    clientId: cfg.clientId || null,
    tenantId: cfg.tenantId,
    scopes: cfg.scopes,
    graphEndpoint: `${GRAPH_BETA}/copilot/conversations`,
    requiresLicense: "Microsoft 365 Copilot (per user)",
    note: "Delegated permissions only — user must sign in with MSAL in the browser.",
  };
}

async function graphRequest(accessToken, path, options = {}) {
  const url = path.startsWith("http") ? path : `${GRAPH_BETA}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const j = JSON.parse(body);
      detail = j.error?.message || j.error?.code || body;
    } catch (_) { /* keep text */ }
    const err = new Error(`${res.status} ${detail}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }

  return res;
}

async function createConversation(accessToken) {
  const res = await graphRequest(accessToken, "/copilot/conversations", {
    method: "POST",
    body: "{}",
  });
  return res.json();
}

function extractLatestBotText(conversation) {
  const messages = conversation?.messages || [];
  if (!messages.length) return "";
  const last = messages[messages.length - 1];
  return last?.text || "";
}

async function chatOverStream(accessToken, conversationId, body) {
  const res = await graphRequest(
    accessToken,
    `/copilot/conversations/${conversationId}/chatOverStream`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Accept: "text/event-stream" },
    }
  );
  return res;
}

async function chatSync(accessToken, conversationId, body) {
  const res = await graphRequest(
    accessToken,
    `/copilot/conversations/${conversationId}/chat`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

/**
 * Parse Graph SSE and yield parsed JSON objects from each data line.
 */
async function* parseGraphSseStream(readable) {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      for (const line of rawEvent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        try {
          yield JSON.parse(payload);
        } catch (_) {
          /* skip non-JSON data lines */
        }
      }
    }
  }
}

module.exports = {
  COPILOT_CHAT_SCOPES,
  GRAPH_BETA,
  getCopilotConfig,
  describeCopilotConfig,
  createConversation,
  chatOverStream,
  chatSync,
  extractLatestBotText,
  parseGraphSseStream,
};
