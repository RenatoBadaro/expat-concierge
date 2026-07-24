/**
 * V2 Confidence & Risk Engine
 * Computes confidence level and risk level for a given response context.
 *
 * confidence: "high" | "medium" | "low"
 * riskLevel:  "low"  | "medium" | "high"
 */

const { DECISION_TYPES } = require("./decisionEngineV2");

/**
 * Score confidence based on retrieved evidence and decision frame.
 *
 * @param {string[]} chunks           - Retrieved policy chunks
 * @param {object}   decision         - Decision frame from decisionEngineV2
 * @param {object}   userContext      - Full user context
 * @param {object}   [specialistOutput] - Optional structured output from specialist agent
 * @returns {{ confidence: string, riskLevel: string, signals: string[] }}
 */
function score(chunks, decision, userContext, specialistOutput = null) {
  const signals = [];
  let confidenceScore = 100; // start at 100, deduct per signal
  let riskScore       = 0;   // start at 0, add per risk factor

  const timeline  = userContext?.profile?.timeline  || {};
  const mobility  = userContext?.profile?.mobility  || {};
  const financial = userContext?.profile?.financial || {};

  // ── Specialist agent quality adjustment ─────────────────────────────────────

  if (specialistOutput) {
    const { eligibilitySignal, riskFlags, policyType, agent } = specialistOutput;

    // Boost confidence when a real specialist (non-generic) was used with evidence
    if (agent && !agent.includes("generic") && chunks.length > 0) {
      confidenceScore += 10;
      signals.push(`Specialist agent active: ${agent}`);
    }

    if (agent?.includes("generic")) {
      confidenceScore -= 10;
      signals.push("Fallback: generic agent used — no specialist available");
    }

    if (eligibilitySignal === "not_supported") {
      confidenceScore -= 30;
      signals.push("Specialist: eligibility not supported by retrieved evidence");
    } else if (eligibilitySignal === "needs_review") {
      confidenceScore -= 15;
      signals.push("Specialist: topic needs human review");
    } else if (eligibilitySignal === "unclear") {
      confidenceScore -= 10;
      signals.push("Specialist: eligibility unclear — insufficient evidence");
    }

    if (riskFlags?.length > 0) {
      riskScore += Math.min(riskFlags.length * 5, 20);
      signals.push(`Specialist risk flags: ${riskFlags.slice(0, 3).join(", ")}`);
    }
  }

  // ── Confidence deductions ────────────────────────────────────────────────────

  if (!chunks || chunks.length === 0) {
    confidenceScore -= 60;
    signals.push("No policy chunks retrieved");
  } else if (chunks.length < 3) {
    confidenceScore -= 20;
    signals.push("Low number of policy chunks retrieved");
  }

  if (decision.decisionType === DECISION_TYPES.INSUFFICIENT) {
    confidenceScore -= 40;
    signals.push("Decision engine: insufficient evidence");
  } else if (decision.decisionType === DECISION_TYPES.NEEDS_REVIEW) {
    confidenceScore -= 25;
    signals.push("Decision engine: exception scenario requiring review");
  } else if (decision.decisionType === DECISION_TYPES.CONDITIONAL) {
    confidenceScore -= 15;
    signals.push("Decision engine: answer is conditional on missing information");
  }

  if (decision.missingInformation && decision.missingInformation.length > 0) {
    confidenceScore -= 10 * Math.min(decision.missingInformation.length, 3);
    signals.push(`${decision.missingInformation.length} missing information item(s)`);
  }

  // ── Risk additions ───────────────────────────────────────────────────────────

  if (timeline.immigrationInProgress && !timeline.visaApproved) {
    riskScore += 40;
    signals.push("Risk: visa not yet approved, immigration in progress");
  }

  if (decision.escalationRequired) {
    riskScore += 25;
    signals.push("Risk: escalation required to specialist team");
  }

  if (mobility.firstAssignment) {
    riskScore += 15;
    signals.push("Risk: first-time assignment — higher guidance complexity");
  }

  if (financial.concernedAboutTaxes) {
    riskScore += 10;
    signals.push("Risk: tax implications noted for this user");
  }

  if (timeline.assignmentStage === "pre-assignment") {
    riskScore += 10;
    signals.push("Risk: pre-assignment stage — many decisions still pending");
  }

  // ── Normalise ────────────────────────────────────────────────────────────────

  const confidence =
    confidenceScore >= 75 ? "high" :
    confidenceScore >= 45 ? "medium" :
    "low";

  const riskLevel =
    riskScore >= 50 ? "high" :
    riskScore >= 25 ? "medium" :
    "low";

  return { confidence, riskLevel, signals };
}

module.exports = { score };
