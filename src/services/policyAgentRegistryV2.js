/**
 * Policy Agent Registry V2
 * Central registry for all specialist agents.
 * Provides safe lookups and routing metadata.
 */

const ltaAgent      = require("../agents/v2/ltaPolicyAgentV2");
const staAgent      = require("../agents/v2/staPolicyAgentV2");
const iaAgent       = require("../agents/v2/internationalAppointmentPolicyAgentV2");
const commuterAgent = require("../agents/v2/commuterPolicyAgentV2");
const genericAgent  = require("../agents/v2/genericPolicyAgentV2");

const REGISTRY = {
  "LTA":      ltaAgent,
  "STA":      staAgent,
  "IA":       iaAgent,
  "COMMUTER": commuterAgent,
};

/**
 * Get the specialist agent for a given assignment type.
 * Falls back to genericAgent if no specific agent is registered.
 *
 * @param {string} assignmentType - e.g. "LTA", "STA", "IA", "COMMUTER"
 * @returns {object} Agent module with { run, AGENT_NAME, POLICY_TYPE }
 */
function getAgentForAssignmentType(assignmentType) {
  return REGISTRY[(assignmentType || "").toUpperCase()] || genericAgent;
}

/**
 * List all registered agent names and their policy types.
 * @returns {Array<{ name: string, policyType: string }>}
 */
function listAvailablePolicyAgents() {
  return [
    ...Object.values(REGISTRY).map((a) => ({ name: a.AGENT_NAME, policyType: a.POLICY_TYPE })),
    { name: genericAgent.AGENT_NAME, policyType: genericAgent.POLICY_TYPE },
  ];
}

/**
 * Check whether a specific assignment type has a registered specialist.
 * @param {string} assignmentType
 * @returns {boolean}
 */
function hasSpecialistAgent(assignmentType) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, (assignmentType || "").toUpperCase());
}

module.exports = {
  getAgentForAssignmentType,
  listAvailablePolicyAgents,
  hasSpecialistAgent,
};
