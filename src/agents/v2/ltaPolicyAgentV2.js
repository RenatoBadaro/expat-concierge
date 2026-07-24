/**
 * LTA Policy Specialist Agent V2
 * Internal advisor for Long-Term Assignment policy interpretation.
 * Never speaks directly to the user — returns structured findings to the Orchestrator.
 */

const { createPolicyAgent } = require("./_basePolicyAgent");

module.exports = createPolicyAgent({
  AGENT_NAME:  "ltaPolicyAgentV2",
  POLICY_TYPE: "LTA",

  ESCALATION_TOPICS: [
    { pattern: /\b(tax|taxes|taxation|equali[sz]ation|withholding)\b/i,          team: "Payroll & Tax Team",            reason: "tax equalization topic" },
    { pattern: /\b(visa|immigration|work permit|entry clearance)\b/i,             team: "Global Mobility — Immigration", reason: "immigration / visa topic" },
    { pattern: /\b(exception|waiver|special approval|out of policy)\b/i,          team: "Global Mobility Team",          reason: "exception / waiver request" },
    { pattern: /\b(payroll|salary|compensation|allowance amount|stipend)\b/i,     team: "Payroll & Tax Team",            reason: "compensation / payroll topic" },
    { pattern: /\b(social security|pension|national insurance)\b/i,               team: "Payroll & Tax Team",            reason: "social security / pension topic" },
  ],

  RISK_TOPICS: [
    { pattern: /\b(school|education|tuition|childcare)\b/i,      flag: "schooling_support_topic" },
    { pattern: /\b(pet|animal)\b/i,                              flag: "pet_relocation_topic" },
    { pattern: /\b(hous|accommodat|apartment|rent)\b/i,          flag: "housing_topic" },
    { pattern: /\b(home leave|travel|flight|ticket)\b/i,         flag: "home_leave_topic" },
    { pattern: /\b(repatriat|return|end of assignment|eoa)\b/i,  flag: "repatriation_topic" },
    { pattern: /\b(hardship|hazard|difficult location)\b/i,      flag: "hardship_topic" },
    { pattern: /\b(loa|letter of assignment)\b/i,                flag: "loa_topic" },
    { pattern: /\b(family|partner|spouse|dependent)\b/i,         flag: "family_coverage_topic" },
  ],

  profileFlags(profile, timeline) {
    const riskFlags          = [];
    const missingInformation = [];
    const escalations        = [];

    const family = profile.family || {};
    const move   = profile.move   || {};

    if (family.hasChildren && move.needsSchoolSearch) {
      riskFlags.push("children_school_search_required");
      missingInformation.push("Target city / school preferences for school search");
    }
    if (family.hasPets) {
      riskFlags.push("pet_relocation_applicable — verify policy coverage");
    }
    if (timeline.immigrationInProgress && !timeline.visaApproved) {
      riskFlags.push("visa_pending");
      missingInformation.push("Visa approval status — currently pending");
      escalations.push({ team: "Global Mobility — Immigration", reason: "visa not yet approved" });
    }

    return { riskFlags, missingInformation, escalations };
  },
});
