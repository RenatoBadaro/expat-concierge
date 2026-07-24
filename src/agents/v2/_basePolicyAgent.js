/**
 * Base Policy Agent Factory
 * Shared logic for all specialist agents. Each agent calls createPolicyAgent()
 * with its own config — topic rules, escalations, risk flags, profile checks.
 */

/**
 * @param {object} config
 * @param {string}   config.AGENT_NAME
 * @param {string}   config.POLICY_TYPE
 * @param {Array}    config.ESCALATION_TOPICS  - { pattern, team, reason }
 * @param {Array}    config.RISK_TOPICS         - { pattern, flag }
 * @param {Function} config.profileFlags        - (profile) => string[]  extra risk flags from user profile
 */
function createPolicyAgent({ AGENT_NAME, POLICY_TYPE, ESCALATION_TOPICS, RISK_TOPICS, profileFlags }) {
  function run(question, chunks, userContext) {
    const profile  = userContext?.profile  || {};
    const timeline = profile.timeline      || {};

    const policyFindings        = [];
    const missingInformation    = [];
    const riskFlags             = [];
    const recommendedEscalation = [];
    const sourceReferences      = [];

    // ── Analyse chunks ─────────────────────────────────────────────────────────
    const hasEvidence = chunks.length > 0;

    if (hasEvidence) {
      chunks.forEach((chunk, i) => {
        const srcMatch = chunk.match(/Policy:\s*([^\n|]+)/i);
        if (srcMatch) sourceReferences.push(srcMatch[1].trim());
        policyFindings.push({
          index:    i,
          excerpt:  chunk.slice(0, 200).trim() + (chunk.length > 200 ? "…" : ""),
          relevant: true,
        });
      });
    }

    // ── Detect escalation topics ───────────────────────────────────────────────
    for (const { pattern, team, reason } of (ESCALATION_TOPICS || [])) {
      if (pattern.test(question)) {
        recommendedEscalation.push({ team, reason });
      }
    }

    // ── Detect risk topics ─────────────────────────────────────────────────────
    for (const { pattern, flag } of (RISK_TOPICS || [])) {
      if (pattern.test(question)) riskFlags.push(flag);
    }

    // ── Profile-driven flags from each specialist ──────────────────────────────
    if (typeof profileFlags === "function") {
      const extra = profileFlags(profile, timeline);
      if (extra.riskFlags)          riskFlags.push(...extra.riskFlags);
      if (extra.missingInformation) missingInformation.push(...extra.missingInformation);
      if (extra.escalations)        recommendedEscalation.push(...extra.escalations);
    }

    // ── Eligibility signal ─────────────────────────────────────────────────────
    let eligibilitySignal;
    if (!hasEvidence) {
      eligibilitySignal = "unclear";
      missingInformation.push(`No ${POLICY_TYPE} policy content retrieved for this question`);
    } else if (recommendedEscalation.length > 0) {
      eligibilitySignal = "needs_review";
    } else {
      eligibilitySignal = "supported";
    }

    // ── Answer guidance ────────────────────────────────────────────────────────
    let answerGuidance;
    if (!hasEvidence) {
      answerGuidance =
        `No ${POLICY_TYPE} policy content retrieved. ` +
        "Provide general market practice guidance only, clearly noting it is not confirmed internal policy.";
    } else {
      answerGuidance =
        `${chunks.length} ${POLICY_TYPE} policy chunk(s) retrieved. ` +
        "Use only retrieved content. Do not extend beyond retrieved evidence. " +
        (recommendedEscalation.length > 0
          ? `Escalation required: ${recommendedEscalation.map((e) => e.team).join(", ")}.`
          : "Evidence appears sufficient for a policy-grounded answer.");
    }

    return {
      agent:                AGENT_NAME,
      policyType:           POLICY_TYPE,
      answerGuidance,
      policyFindings,
      eligibilitySignal,
      missingInformation,
      riskFlags,
      recommendedEscalation,
      sourceReferences:     [...new Set(sourceReferences)],
    };
  }

  return { run, AGENT_NAME, POLICY_TYPE };
}

module.exports = { createPolicyAgent };
