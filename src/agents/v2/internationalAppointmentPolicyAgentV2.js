/**
 * International Appointment Policy Specialist Agent V2
 * Internal advisor for International Appointment (IA) policy/program guidance.
 * Never speaks directly to the user — returns structured findings to the Orchestrator.
 */

const { createPolicyAgent } = require("./_basePolicyAgent");

module.exports = createPolicyAgent({
  AGENT_NAME:  "internationalAppointmentPolicyAgentV2",
  POLICY_TYPE: "IA",

  ESCALATION_TOPICS: [
    { pattern: /\b(tax|taxes|taxation|withholding)\b/i,                    team: "Payroll & Tax Team",            reason: "tax / local entity implications" },
    { pattern: /\b(visa|immigration|right to work)\b/i,                    team: "Global Mobility — Immigration", reason: "immigration / right to work" },
    { pattern: /\b(compensation|package|proposal|salary|benefit)\b/i,     team: "Rewards & Benefits",            reason: "compensation / benefits topic" },
    { pattern: /\b(local|entity|employment contract|local hire)\b/i,       team: "Global Mobility Team",          reason: "local employment / entity topic" },
    { pattern: /\b(exception|waiver|approval)\b/i,                         team: "Global Mobility Team",          reason: "exception / approval required" },
    { pattern: /\b(pension|social security|national insurance)\b/i,        team: "Payroll & Tax Team",            reason: "pension / social security" },
  ],

  RISK_TOPICS: [
    { pattern: /\b(package|proposal|mobility package)\b/i,  flag: "ia_package_topic" },
    { pattern: /\b(local terms|local contract)\b/i,         flag: "local_terms_topic" },
    { pattern: /\b(repatriat|return|end of ia)\b/i,         flag: "repatriation_topic" },
    { pattern: /\b(family|partner|dependent)\b/i,           flag: "family_coverage_topic" },
    { pattern: /\b(approval|governance|sign.?off)\b/i,      flag: "governance_topic" },
  ],

  profileFlags(profile, timeline) {
    const riskFlags          = [];
    const missingInformation = [];
    const escalations        = [];

    if (timeline.immigrationInProgress && !timeline.visaApproved) {
      riskFlags.push("visa_pending");
      missingInformation.push("Right to work / visa status — currently pending");
      escalations.push({ team: "Global Mobility — Immigration", reason: "right to work not yet confirmed" });
    }

    return { riskFlags, missingInformation, escalations };
  },
});
