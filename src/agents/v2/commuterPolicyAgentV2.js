/**
 * Commuter Policy Specialist Agent V2
 * Internal advisor for Commuter policy/program guidance.
 * Never speaks directly to the user — returns structured findings to the Orchestrator.
 */

const { createPolicyAgent } = require("./_basePolicyAgent");

module.exports = createPolicyAgent({
  AGENT_NAME:  "commuterPolicyAgentV2",
  POLICY_TYPE: "COMMUTER",

  ESCALATION_TOPICS: [
    { pattern: /\b(tax|taxes|taxation|dual tax|cross.?border tax)\b/i,   team: "Payroll & Tax Team",            reason: "cross-border tax topic" },
    { pattern: /\b(visa|immigration|work permit|border)\b/i,             team: "Global Mobility — Immigration", reason: "immigration / border crossing topic" },
    { pattern: /\b(payroll|salary|host payroll|home payroll)\b/i,        team: "Payroll & Tax Team",            reason: "payroll topic" },
    { pattern: /\b(exception|waiver|non.?standard|approval)\b/i,         team: "Global Mobility Team",          reason: "exception / approval required" },
    { pattern: /\b(social security|pension|national insurance)\b/i,      team: "Payroll & Tax Team",            reason: "cross-border social security" },
  ],

  RISK_TOPICS: [
    { pattern: /\b(travel|flight|transport|commut)\b/i,       flag: "travel_pattern_topic" },
    { pattern: /\b(expense|per diem|allowance)\b/i,           flag: "expenses_topic" },
    { pattern: /\b(accommodation|hotel|weekly stay)\b/i,      flag: "accommodation_topic" },
    { pattern: /\b(family|partner|home|household)\b/i,        flag: "family_home_topic" },
    { pattern: /\b(frequency|days per week|rotation)\b/i,     flag: "travel_frequency_topic" },
    { pattern: /\b(repatriat|end of commuter|exit)\b/i,       flag: "exit_topic" },
  ],

  profileFlags(profile, timeline) {
    const riskFlags          = [];
    const missingInformation = [];
    const escalations        = [];

    if (timeline.immigrationInProgress && !timeline.visaApproved) {
      riskFlags.push("border_crossing_authorization_pending");
      missingInformation.push("Work authorization for host country — currently pending");
      escalations.push({ team: "Global Mobility — Immigration", reason: "border crossing authorization not yet confirmed" });
    }

    return { riskFlags, missingInformation, escalations };
  },
});
