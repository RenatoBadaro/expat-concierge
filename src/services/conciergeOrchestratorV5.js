/**
 * V5 Concierge Orchestrator.
 *
 * The provider is deliberately the last step. Every V5 answer first passes
 * through the existing V2/V3 policy specialist, decision, and confidence
 * engines so Copilot, OpenAI, and local models receive the same structured
 * policy context.
 */

const { checkPolicyAccess, filterChunksByPolicy, buildRetrievalOptions, checkQuestionScope } = require("./policyAccessControlV2");
const { analyze } = require("./decisionEngineV2");
const { score } = require("./confidenceEngineV2");
const { retrieveRelevantChunks } = require("./retrieval");
const { getPolicies } = require("./policyStore");
const { route: routeToAgent } = require("../agents/v2/policyAgentRouterV2");
const { validateSpecialistOutput, buildChatContext } = require("../agents/v2/chatAgentV2");
const { audit } = require("./auditLoggerV2");
const { buildCopilotInstructions } = require("./v4MobilityPrompt");
const fs = require("fs");
const path = require("path");

function loadJson(fileName, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", fileName), "utf8"));
  } catch (err) {
    console.warn(`[V5] Context file unavailable (${fileName}):`, err.message);
    return fallback;
  }
}

function buildExperienceContext() {
  const actionCatalog = loadJson("assets/action-log-tasks-v4.json", { version: "fallback", tasks: [] });
  const riskMatrix = loadJson("data/risk-matrix.json", { version: "fallback", tiers: {}, gates: {}, escalationRules: [] });
  const actions = (actionCatalog.tasks || []).map((task) =>
    `${task.id}. ${task.task} | category=${task.cat} | owner=${task.owner} | contact=${task.contact || "—"}`
  ).join("\n");
  const rules = (riskMatrix.escalationRules || []).join("\n- ");
  return `[V5 EXPERIENCE CONTEXT]
The V5 experience includes the Action Log and Assignment Risk Matrix. Use these sources when framing next steps and escalation guidance.
Action catalog version: ${actionCatalog.version || "unknown"} (${(actionCatalog.tasks || []).length} tasks)
Risk matrix version: ${riskMatrix.version || "unknown"}
Risk tiers: ${Object.entries(riskMatrix.tiers || {}).map(([key, value]) => `${key}=${value.label || key} (weight ${value.weight})`).join(", ")}
Risk escalation rules:
- ${rules || "Follow the configured risk matrix thresholds."}
Action catalog:
${actions || "No action catalog loaded."}`;
}

async function runPolicyPipeline(question, userContext) {
  const access = checkPolicyAccess(userContext);
  if (!access.allowed) return { ok: false, status: 403, error: access.reason };

  const scopeCheck = checkQuestionScope(question, userContext);
  if (!scopeCheck.inScope) {
    return {
      ok: false,
      status: 403,
      error: "out_of_scope",
      answer: scopeCheck.violation,
      assignmentType: userContext.permissions.assignmentType,
    };
  }

  const allPolicies = getPolicies();
  const retrievalOpts = buildRetrievalOptions(userContext);
  let chunks = [];
  if (allPolicies.length > 0) {
    try {
      const raw = await retrieveRelevantChunks(
        `${retrievalOpts.assignmentType} ${question}`,
        12
      );
      chunks = filterChunksByPolicy(raw, userContext);
    } catch (err) {
      console.warn("[V5] Retrieval warning:", err.message);
    }
  }

  // Deliberately execute the specialist even when retrieval is empty. This
  // makes the V5 pipeline explicit and keeps the agent responsible for
  // assignment-specific signals and safe fallback behavior.
  let specialistOutput = routeToAgent(question, chunks, userContext);
  const validation = validateSpecialistOutput(specialistOutput, userContext);
  let fallbackUsed = false;
  if (!validation.valid) {
    const genericAgent = require("../agents/v2/genericPolicyAgentV2");
    specialistOutput = genericAgent.run(question, chunks, userContext);
    fallbackUsed = true;
  }

  const decision = analyze(question, chunks, userContext, specialistOutput);
  const scored = score(chunks, decision, userContext, specialistOutput);
  const agentContext = buildChatContext(
    specialistOutput,
    decision,
    scored.confidence,
    scored.riskLevel
  );

  const meta = {
    version: "5.0",
    pipeline: ["policy-agent-v2/v3", "decision-engine-v2", "confidence-engine-v2", "provider"],
    userId: userContext.id || null,
    userName: userContext.identity.name,
    assignmentType: userContext.permissions.assignmentType,
    policiesUsed: retrievalOpts.allowedPolicies,
    chunksRetrieved: chunks.length,
    selectedPolicyAgent: specialistOutput.agent,
    policyType: specialistOutput.policyType,
    decisionType: decision.decisionType,
    confidence: scored.confidence,
    riskLevel: scored.riskLevel,
    escalationRequired: decision.escalationRequired,
    escalationTeam: decision.escalationTeam || null,
    missingInformation: decision.missingInformation,
    fallbackUsed,
  };

  audit({
    userId: userContext.id,
    userName: userContext.identity.name,
    assignmentType: userContext.permissions.assignmentType,
    question,
    selectedPolicyAgent: specialistOutput.agent,
    policyType: specialistOutput.policyType,
    eligibilitySignal: specialistOutput.eligibilitySignal,
    decisionType: decision.decisionType,
    confidence: scored.confidence,
    riskLevel: scored.riskLevel,
    riskFlags: specialistOutput.riskFlags,
    escalationRequired: decision.escalationRequired,
    escalationTeam: decision.escalationTeam || null,
    missingInformation: decision.missingInformation,
    fallbackUsed,
    scopedPoliciesUsed: retrievalOpts.allowedPolicies,
    chunksRetrieved: chunks.length,
    warnings: scored.signals.filter((s) => s.startsWith("Risk:")),
  });

  const policyContext = allPolicies.length === 0
    ? `[V5 POLICY CONTEXT] No indexed policies. Use the embedded assignment skill and specialist guidance; do not default to vague market practice.`
    : chunks.length > 0
      ? `[V5 POLICY CONTEXT]\n[Active assignment: ${retrievalOpts.assignmentType}]\n[Authorized policies: ${retrievalOpts.allowedPolicies.join(", ")}]\n--- Relevant Policy Context ---\n${chunks.join("\n\n---\n\n")}\n--- End Policy Context ---`
      : `[V5 POLICY CONTEXT] No relevant chunks retrieved for ${retrievalOpts.assignmentType}; use the embedded assignment skill and specialist guidance.`;

  const experienceContext = buildExperienceContext();

  return {
    ok: true,
    userContext,
    instructions: buildCopilotInstructions(userContext),
    orchestrationContext: `${experienceContext}\n\n${policyContext}\n\n[V5 ORCHESTRATOR — MANDATORY]\n${agentContext}`,
    meta,
  };
}

module.exports = { runPolicyPipeline };
