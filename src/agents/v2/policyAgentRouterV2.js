/**
 * Policy Agent Router V2
 * Selects the correct specialist agent based on the user's assignment type.
 * Respects policyAccessControlV2 — never routes to an agent the user cannot access.
 */

const ltaAgent     = require("./ltaPolicyAgentV2");
const staAgent     = require("./staPolicyAgentV2");
const iaAgent      = require("./internationalAppointmentPolicyAgentV2");
const commuterAgent = require("./commuterPolicyAgentV2");
const genericAgent = require("./genericPolicyAgentV2");

const AGENT_MAP = {
  "LTA":      ltaAgent,
  "STA":      staAgent,
  "IA":       iaAgent,
  "COMMUTER": commuterAgent,
};

/**
 * Route the question to the correct specialist agent.
 *
 * @param {string}   question    - User question
 * @param {string[]} chunks      - Pre-filtered, scoped policy chunks
 * @param {object}   userContext - Full user context
 * @returns {object} Specialist agent output
 */
function route(question, chunks, userContext) {
  const assignmentType = (userContext?.permissions?.assignmentType || "").toUpperCase();
  const agent = AGENT_MAP[assignmentType] || genericAgent;

  // Safety check: agent policyType must match the user's assignmentType
  // (genericAgent is always safe as a fallback)
  if (agent.POLICY_TYPE !== "GENERIC" && agent.POLICY_TYPE !== assignmentType) {
    console.warn(`[PolicyAgentRouter] Mismatch: agent=${agent.POLICY_TYPE}, user=${assignmentType} — falling back to generic`);
    return genericAgent.run(question, chunks, userContext);
  }

  return agent.run(question, chunks, userContext);
}

/**
 * Returns the agent name that would be selected for a given assignment type.
 */
function getAgentNameForType(assignmentType) {
  const agent = AGENT_MAP[(assignmentType || "").toUpperCase()] || genericAgent;
  return agent.AGENT_NAME;
}

module.exports = { route, getAgentNameForType };
