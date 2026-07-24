/**
 * Chat Agent V2
 * Responsible for the final user-facing experience.
 * Consumes validated specialist output + engines and builds the LLM context block.
 * The LLM call itself happens in askV2.js — this module prepares the context only.
 */

/**
 * Validate specialist agent output before trusting it.
 * Returns { valid: true } or { valid: false, reason: string }.
 *
 * @param {object} specialistOutput
 * @param {object} userContext
 */
function validateSpecialistOutput(specialistOutput, userContext) {
  if (!specialistOutput || !specialistOutput.agent) {
    return { valid: false, reason: "No specialist output returned" };
  }
  if (!specialistOutput.eligibilitySignal) {
    return { valid: false, reason: "Missing eligibilitySignal" };
  }
  if (!Array.isArray(specialistOutput.riskFlags)) {
    return { valid: false, reason: "Missing riskFlags array" };
  }
  if (!Array.isArray(specialistOutput.missingInformation)) {
    return { valid: false, reason: "Missing missingInformation array" };
  }

  // Policy type must match user's assignment type (generic is always valid)
  const userType     = (userContext?.permissions?.assignmentType || "").toUpperCase();
  const agentType    = (specialistOutput.policyType || "").toUpperCase();
  if (agentType !== "GENERIC" && agentType !== userType) {
    return { valid: false, reason: `Agent policyType (${agentType}) does not match user assignmentType (${userType})` };
  }

  return { valid: true };
}

/**
 * Build the specialist context block that gets injected into the LLM system call.
 *
 * @param {object} specialistOutput  - From policyAgentRouterV2
 * @param {object} decision          - From decisionEngineV2
 * @param {string} confidence        - From confidenceEngineV2
 * @param {string} riskLevel         - From confidenceEngineV2
 * @returns {string} Context block string
 */
function buildChatContext(specialistOutput, decision, confidence, riskLevel) {
  const {
    agent,
    policyType,
    answerGuidance,
    eligibilitySignal,
    missingInformation,
    riskFlags,
    recommendedEscalation,
  } = specialistOutput;

  const lines = [
    `[SPECIALIST: ${agent} | Policy: ${policyType} | Signal: ${eligibilitySignal}]`,
    `[GUIDANCE: ${answerGuidance}]`,
    `[DECISION: ${decision.decisionType} | CONFIDENCE: ${confidence} | RISK: ${riskLevel}]`,
  ];

  if (missingInformation?.length > 0) {
    lines.push(`[MISSING: ${missingInformation.join("; ")}]`);
  }
  if (riskFlags?.length > 0) {
    lines.push(`[RISK FLAGS: ${riskFlags.join(", ")}]`);
  }
  if (recommendedEscalation?.length > 0) {
    const esc = recommendedEscalation.map((e) => `${e.team} (${e.reason})`).join("; ");
    lines.push(`[ESCALATE TO: ${esc}]`);
  }

  return lines.join("\n");
}

module.exports = { validateSpecialistOutput, buildChatContext };
