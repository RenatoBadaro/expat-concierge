/**
 * V2 Policy Access Control
 * Enforces per-user policy scoping — prevents cross-policy leakage and
 * blocks requests from unauthorized assignment types.
 */

/**
 * Validate that the user is authorized to query a given set of policies.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
function checkPolicyAccess(userContext, requestedPolicies = []) {
  if (!userContext || !userContext.permissions) {
    return { allowed: false, reason: "No user context provided." };
  }

  const { policiesAllowed, assignmentType } = userContext.permissions;

  if (!policiesAllowed || policiesAllowed.length === 0) {
    return {
      allowed: false,
      reason: `User has no policy access configured for assignment type ${assignmentType}.`,
    };
  }

  if (requestedPolicies.length > 0) {
    const unauthorized = requestedPolicies.filter(
      (p) => !policiesAllowed.includes(p)
    );
    if (unauthorized.length > 0) {
      return {
        allowed: false,
        reason: `Access denied to policies: ${unauthorized.join(", ")}. User is authorized for: ${policiesAllowed.join(", ")}.`,
      };
    }
  }

  return { allowed: true };
}

// All known assignment types in the system
const ALL_ASSIGNMENT_TYPES = ["lta", "sta", "ia", "commuter"];

/**
 * Detect if the question explicitly references an assignment type the user
 * is NOT authorized for. Returns { inScope: true } or
 * { inScope: false, violation: string, mentionedTypes: string[] }.
 */
function checkQuestionScope(question, userContext) {
  if (!question || !userContext?.permissions) return { inScope: true };

  const userType      = (userContext.permissions.assignmentType || "").toLowerCase();
  const questionLower = question.toLowerCase();

  const unauthorized = ALL_ASSIGNMENT_TYPES.filter(
    (t) => t !== userType && questionLower.includes(t)
  );

  if (unauthorized.length > 0) {
    return {
      inScope: false,
      mentionedTypes: unauthorized,
      violation:
        `Your account is set up for ${userContext.permissions.assignmentType.toUpperCase()} assignments. ` +
        `I can only answer questions within your authorized assignment type and policies. ` +
        `For ${unauthorized.map((t) => t.toUpperCase()).join(", ")} questions, please contact your Global Mobility team.`,
    };
  }

  return { inScope: true };
}

/**
 * Filter a list of policy chunks to only include those from allowed policies.
 * chunk format (from retrieval): each chunk string may contain a "Policy: <name>" marker.
 * Returns only chunks whose policy name is in userContext.permissions.policiesAllowed.
 */
function filterChunksByPolicy(chunks, userContext) {
  if (!userContext || !userContext.permissions) return [];

  const { policiesAllowed, assignmentType } = userContext.permissions;

  return chunks.filter((chunk) => {
    // Try to extract policy name from chunk header: "Policy: <name> | ..."
    const match = chunk.match(/Policy:\s*([^\s|]+)/i);
    if (!match) {
      // Chunk has no policy tag — allowed through (retrieval may not have tagged it)
      return true;
    }
    const chunkPolicy = match[1].toLowerCase();

    // Check if this chunk's policy is in the user's allowed list
    return policiesAllowed.some(
      (p) => p.toLowerCase() === chunkPolicy || chunkPolicy.includes(p.toLowerCase())
    );
  });
}

/**
 * Build a scoped retrieval options object for use with the retrieval service.
 */
function buildRetrievalOptions(userContext) {
  if (!userContext || !userContext.permissions) {
    return { allowedPolicies: [], assignmentType: null };
  }
  return {
    allowedPolicies: userContext.permissions.policiesAllowed,
    assignmentType: userContext.permissions.assignmentType,
  };
}

/**
 * Determine the escalation target based on topic.
 */
function getEscalationTarget(topic) {
  const topicLower = (topic || "").toLowerCase();
  if (topicLower.includes("immigration") || topicLower.includes("visa")) {
    return { team: "Global Mobility — Immigration", reason: "immigration / visa matters" };
  }
  if (topicLower.includes("tax") || topicLower.includes("payroll")) {
    return { team: "Payroll & Tax", reason: "tax equalization / payroll matters" };
  }
  if (topicLower.includes("benefit") || topicLower.includes("reward")) {
    return { team: "Rewards & Benefits", reason: "benefits / compensation matters" };
  }
  return { team: "Global Mobility Team", reason: "general mobility support" };
}

module.exports = {
  checkPolicyAccess,
  checkQuestionScope,
  filterChunksByPolicy,
  buildRetrievalOptions,
  getEscalationTarget,
};
