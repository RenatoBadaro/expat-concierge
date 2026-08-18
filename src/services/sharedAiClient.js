/**
 * V4.1 shared-provider client.
 * The credential stays on the server; testers never receive an API key.
 *
 * Supports Azure OpenAI and any OpenAI-compatible endpoint. Asimov keys are
 * intentionally not treated as chat keys unless Asimov provides an
 * OpenAI-compatible completion endpoint for the account.
 */

const https = require("https");
const OpenAI = require("openai");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function hasAzureConfig() {
  return Boolean(
    process.env.AZURE_OPENAI_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

function describeSharedAIConfig() {
  const provider = (process.env.V41_PROVIDER || "").toLowerCase();
  if (provider === "azure" && hasAzureConfig()) {
    return { configured: true, provider: "azure", model: process.env.AZURE_OPENAI_DEPLOYMENT };
  }
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return { configured: true, provider: "openai", model: process.env.OPENAI_MODEL || "gpt-4o" };
  }
  if (provider === "compatible" && process.env.V41_API_KEY && process.env.V41_BASE_URL) {
    return {
      configured: true,
      provider: "compatible",
      model: process.env.V41_MODEL || "gpt-4o",
      baseUrl: process.env.V41_BASE_URL,
    };
  }
  return {
    configured: false,
    provider: provider || null,
    message: "Configure V41_PROVIDER and the matching server-side credential.",
  };
}

function createSharedAIClient() {
  const provider = (process.env.V41_PROVIDER || "").toLowerCase();

  if (provider === "azure" && hasAzureConfig()) {
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
    return {
      provider,
      model: deployment,
      client: new OpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        baseURL: `${endpoint}/openai/deployments/${deployment}`,
        defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview" },
        defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
        httpAgent: httpsAgent,
      }),
    };
  }

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return {
      provider,
      model: process.env.OPENAI_MODEL || "gpt-4o",
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY, httpAgent: httpsAgent }),
    };
  }

  if (provider === "compatible" && process.env.V41_API_KEY && process.env.V41_BASE_URL) {
    return {
      provider,
      model: process.env.V41_MODEL || "gpt-4o",
      client: new OpenAI({
        apiKey: process.env.V41_API_KEY,
        baseURL: process.env.V41_BASE_URL.replace(/\/$/, ""),
        httpAgent: httpsAgent,
      }),
    };
  }

  throw new Error("V4.1 shared AI provider is not configured.");
}

module.exports = { createSharedAIClient, describeSharedAIConfig };
