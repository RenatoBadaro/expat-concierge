/**
 * Audit Logger V2
 * Records structured metadata for each V2 interaction.
 * Does NOT log raw policy chunks, personal identifiers, or secrets.
 */

const SAFE_FIELDS_ONLY = true; // guard — never relax this

/**
 * Build a safe, loggable audit record for a V2 interaction.
 *
 * @param {object} params
 * @returns {object} Audit record (safe to log / store)
 */
function buildAuditRecord({
  userId,
  userName,
  assignmentType,
  question,
  selectedPolicyAgent,
  policyType,
  eligibilitySignal,
  decisionType,
  confidence,
  riskLevel,
  riskFlags        = [],
  escalationRequired = false,
  escalationTeam   = null,
  missingInformation = [],
  fallbackUsed     = false,
  scopedPoliciesUsed = [],
  chunksRetrieved  = 0,
  warnings         = [],
}) {
  return {
    timestamp:          new Date().toISOString(),
    userId:             userId || "unknown",
    userName:           userName || "unknown",
    assignmentType:     assignmentType || "unknown",
    questionLength:     (question || "").length, // length only — never log raw question
    selectedPolicyAgent,
    policyType,
    eligibilitySignal,
    decisionType,
    confidence,
    riskLevel,
    riskFlags,
    escalationRequired,
    escalationTeam,
    missingInformationCount: (missingInformation || []).length,
    fallbackUsed,
    scopedPoliciesUsed,
    chunksRetrieved,
    warnings,
  };
}

/**
 * Log an audit record to stdout (structured JSON).
 * In production, replace with a proper logging service.
 *
 * @param {object} auditRecord
 */
function logAuditRecord(auditRecord) {
  console.log("[V2 AUDIT]", JSON.stringify(auditRecord));
}

/**
 * Build and immediately log an audit record.
 * Convenience wrapper used by askV2.js.
 */
function audit(params) {
  const record = buildAuditRecord(params);
  logAuditRecord(record);
  return record;
}

module.exports = { audit, buildAuditRecord, logAuditRecord };
