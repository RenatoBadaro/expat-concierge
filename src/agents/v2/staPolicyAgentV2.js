/**
 * STA Policy Specialist Agent V2
 * Internal advisor for Short-Term Assignment policy interpretation.
 * Never speaks directly to the user — returns structured findings to the Orchestrator.
 */

const { createPolicyAgent } = require("./_basePolicyAgent");

module.exports = createPolicyAgent({
  AGENT_NAME:  "staPolicyAgentV2",
  POLICY_TYPE: "STA",

  ESCALATION_TOPICS: [
    { pattern: /\b(tax|taxes|taxation|withholding)\b/i,                       team: "Payroll & Tax Team",            reason: "tax topic — STA may have split payroll" },
    { pattern: /\b(visa|immigration|work permit|business visa)\b/i,           team: "Global Mobility — Immigration", reason: "immigration / visa topic" },
    { pattern: /\b(extension|extend|prolong)\b/i,                             team: "Global Mobility Team",          reason: "STA extension requires approval" },
    { pattern: /\b(exception|waiver|special approval|out of policy)\b/i,      team: "Global Mobility Team",          reason: "exception / waiver request" },
    { pattern: /\b(payroll|salary|compensation|host payroll|home payroll)\b/i, team: "Payroll & Tax Team",           reason: "payroll topic" },
  ],

  RISK_TOPICS: [
    { pattern: /\b(temporary|hotel|serviced apartment|short let)\b/i,  flag: "temporary_living_topic" },
    { pattern: /\b(settling.?in|destination service)\b/i,              flag: "settling_in_topic" },
    { pattern: /\b(repatriat|return|end of assignment)\b/i,            flag: "repatriation_topic" },
    { pattern: /\b(family|partner|spouse|dependent)\b/i,               flag: "family_coverage_topic" },
    { pattern: /\b(expense|per diem|daily rate)\b/i,                   flag: "expenses_topic" },
    { pattern: /\b(loa|letter of assignment|duration)\b/i,             flag: "loa_duration_topic" },
  ],

  profileFlags(profile, timeline) {
    const riskFlags          = [];
    const missingInformation = [];
    const escalations        = [];

    if (timeline.immigrationInProgress && !timeline.visaApproved) {
      riskFlags.push("visa_pending");
      missingInformation.push("Visa / business travel authorization status — currently pending");
      escalations.push({ team: "Global Mobility — Immigration", reason: "visa not yet approved" });
    }

    return { riskFlags, missingInformation, escalations };
  },
});
