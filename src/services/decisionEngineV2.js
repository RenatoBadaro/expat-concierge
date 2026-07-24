/**
 * V2 Decision Engine
 * Analyzes the query + context to produce a structured decision frame:
 * decisionType, rationale, missingInformation, escalationRequired.
 */

const DECISION_TYPES = {
  CLEAR:        "clear",          // Policy evidence supports a definitive answer
  CONDITIONAL:  "conditional",    // Answer depends on missing user-specific data
  INSUFFICIENT: "insufficient",   // No policy evidence found
  NEEDS_REVIEW: "needs_review",   // Exception scenario; requires human review
  OUT_OF_SCOPE: "out_of_scope",   // Topic not covered by user's allowed policies
};

/**
 * Analyze context and user profile to produce a decision frame.
 *
 * @param {string}   question          - Raw user question
 * @param {string[]} chunks            - Retrieved policy chunks
 * @param {object}   userContext       - Full user context object
 * @param {object}   [specialistOutput] - Optional structured output from a Policy Specialist Agent
 * @returns {object} Decision frame
 */
function analyze(question, chunks, userContext, specialistOutput = null) {
  const profile  = userContext?.profile  || {};
  const timeline = profile.timeline      || {};
  const mobility = profile.mobility      || {};
  const family   = profile.family        || {};
  const move     = profile.move          || {};
  const financial = profile.financial    || {};

  const missingInformation = [];
  let   escalationRequired = false;
  let   escalationTeam     = null;
  let   decisionType       = DECISION_TYPES.CLEAR;

  // ── Specialist agent override ──────────────────────────────────────────────
  // If a specialist agent ran and returned structured output, use its signals
  // to upgrade the decision frame before applying heuristic rules.
  if (specialistOutput) {
    const { eligibilitySignal, recommendedEscalation, riskFlags, missingInformation: smi } = specialistOutput;

    if (eligibilitySignal === "not_supported") {
      decisionType = DECISION_TYPES.INSUFFICIENT;
    } else if (eligibilitySignal === "needs_review" && decisionType === DECISION_TYPES.CLEAR) {
      decisionType = DECISION_TYPES.NEEDS_REVIEW;
    } else if (eligibilitySignal === "unclear" && decisionType === DECISION_TYPES.CLEAR) {
      decisionType = DECISION_TYPES.CONDITIONAL;
    }

    if (recommendedEscalation?.length > 0) {
      escalationRequired = true;
      escalationTeam     = escalationTeam || recommendedEscalation[0].team;
    }

    if (smi?.length > 0) {
      for (const item of smi) {
        if (!missingInformation.includes(item)) missingInformation.push(item);
      }
    }

    if (riskFlags?.includes("visa_pending") || riskFlags?.includes("border_crossing_authorization_pending")) {
      escalationRequired = true;
      escalationTeam     = escalationTeam || "Global Mobility — Immigration";
    }
  }

  // ── Evidence check ──────────────────────────────────────────────────────────
  if (!chunks || chunks.length === 0) {
    decisionType = DECISION_TYPES.INSUFFICIENT;
  }

  // ── Immigration / visa flags ────────────────────────────────────────────────
  const isImmigrationTopic =
    /\b(visa|immigration|work permit|permit|entry|border)\b/i.test(question);
  if (isImmigrationTopic || (timeline.immigrationInProgress && !timeline.visaApproved)) {
    escalationRequired = true;
    escalationTeam     = "Global Mobility — Immigration Team";
    if (!timeline.visaApproved) {
      missingInformation.push("Visa approval status (currently pending)");
    }
    if (decisionType === DECISION_TYPES.CLEAR) {
      decisionType = DECISION_TYPES.NEEDS_REVIEW;
    }
  }

  // ── Tax & payroll flags ─────────────────────────────────────────────────────
  const isTaxTopic = /\b(tax|taxes|taxation|payroll|withholding|equali[sz]ation)\b/i.test(question);
  if (isTaxTopic || financial.concernedAboutTaxes) {
    escalationRequired = true;
    escalationTeam     = escalationTeam || "Payroll & Tax Team";
    if (decisionType === DECISION_TYPES.CLEAR) {
      decisionType = DECISION_TYPES.CONDITIONAL;
    }
  }

  // ── Family / school information gaps ───────────────────────────────────────
  const isSchoolTopic = /\b(school|education|children|kids|tuition)\b/i.test(question);
  if (isSchoolTopic && family.hasChildren && move.needsSchoolSearch) {
    missingInformation.push("School preferences and target area/city for school search");
  }

  // ── Housing information gaps ────────────────────────────────────────────────
  const isHousingTopic = /\b(hous|accommodation|apartment|rent|temporary|hotel)\b/i.test(question);
  if (isHousingTopic && move.needsTempHousing) {
    missingInformation.push("Preferred arrival date for temporary housing booking");
  }

  // ── First assignment — always flag missing planning context ─────────────────
  if (mobility.firstAssignment && missingInformation.length === 0 && decisionType === DECISION_TYPES.CLEAR) {
    missingInformation.push("Preferred start date of assignment");
  }

  // ── Build rationale ─────────────────────────────────────────────────────────
  let rationale = "";
  if (decisionType === DECISION_TYPES.INSUFFICIENT) {
    rationale = "No policy evidence retrieved for this topic under the user's authorized policies.";
  } else if (decisionType === DECISION_TYPES.NEEDS_REVIEW) {
    rationale = "Topic involves pending immigration or exceptional circumstances requiring human review.";
  } else if (decisionType === DECISION_TYPES.CONDITIONAL) {
    rationale = "Answer can be provided but depends on additional context or involves tax implications.";
  } else {
    rationale = `${chunks.length} policy chunk(s) retrieved and used to formulate the answer.`;
  }

  return {
    decisionType,
    rationale,
    missingInformation,
    escalationRequired,
    escalationTeam,
  };
}

module.exports = { analyze, DECISION_TYPES };
