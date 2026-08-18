/**
 * LLM client factory — Azure OpenAI (preferred) or legacy GitHub Models.
 * GitHub Models (models.inference.ai.azure.com / models.github.ai) was retired July 2026.
 */

const https = require("https");
const OpenAI = require("openai");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const GITHUB_MODELS_RETIRED_MSG =
  "GitHub Models was retired on 2026-07-30. Configure AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT in .env.";

function hasAzureConfig() {
  return (
    process.env.AZURE_OPENAI_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

function createAzureClient() {
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/$/, "");
  return {
    provider: "azure",
    client: new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: {
        "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
      httpAgent: httpsAgent,
    }),
    model: deployment,
  };
}

function createGitHubClient() {
  return {
    provider: "github",
    client: new OpenAI({
      apiKey: process.env.GITHUB_TOKEN,
      baseURL: "https://models.inference.ai.azure.com",
      httpAgent: httpsAgent,
    }),
    model: process.env.GITHUB_MODEL || "gpt-4o",
  };
}

function createLLMClient() {
  const provider = (process.env.PROVIDER || "").toLowerCase();

  if (provider === "azure" || (provider !== "github" && hasAzureConfig())) {
    return createAzureClient();
  }

  if (provider === "github" || process.env.GITHUB_TOKEN) {
    console.warn("[LLM]", GITHUB_MODELS_RETIRED_MSG);
    return createGitHubClient();
  }

  throw new Error(GITHUB_MODELS_RETIRED_MSG);
}

function describeLLMConfig() {
  if (hasAzureConfig()) {
    return {
      configured: true,
      provider: "azure",
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    };
  }
  if (process.env.GITHUB_TOKEN) {
    return {
      configured: true,
      provider: "github",
      model: process.env.GITHUB_MODEL || "gpt-4o",
      warning: GITHUB_MODELS_RETIRED_MSG,
    };
  }
  return { configured: false, provider: null, message: GITHUB_MODELS_RETIRED_MSG };
}

function isGitHubRetirementError(err) {
  const msg = (err?.message || "").toLowerCase();
  return msg.includes("404") || msg.includes("410") || msg.includes("github_models_retirement");
}

module.exports = {
  createLLMClient,
  describeLLMConfig,
  isGitHubRetirementError,
  GITHUB_MODELS_RETIRED_MSG,
  httpsAgent,
};
