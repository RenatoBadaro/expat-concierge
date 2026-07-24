/**
 * Generic Policy Agent V2
 * Fallback internal agent — used when no specific specialist can safely handle the request.
 * Provides only general guidance; never makes policy-specific claims without evidence.
 */

const AGENT_NAME  = "genericPolicyAgentV2";
const POLICY_TYPE = "GENERIC";

function run(question, chunks, userContext) {
  const sourceReferences = [];
  const policyFindings   = [];
  const riskFlags        = ["generic_fallback_used"];
  const missingInformation = [];
  const recommendedEscalation = [
    { team: "Global Mobility Team", reason: "no specific policy specialist available for this assignment type" },
  ];

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
  } else {
    missingInformation.push("No policy content retrieved — general guidance only");
  }

  return {
    agent:  AGENT_NAME,
    policyType: POLICY_TYPE,
    answerGuidance:
      hasEvidence
        ? `${chunks.length} policy chunk(s) retrieved. Provide general guidance only. Recommend confirming with Global Mobility.`
        : "No policy evidence available. Provide general mobility market practice. Clearly state this is not internal policy. Recommend Global Mobility contact.",
    policyFindings,
    eligibilitySignal: "unclear",
    missingInformation,
    riskFlags,
    recommendedEscalation,
    sourceReferences: [...new Set(sourceReferences)],
  };
}

module.exports = { run, AGENT_NAME, POLICY_TYPE };
