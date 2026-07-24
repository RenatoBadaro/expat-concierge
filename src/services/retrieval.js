/**
 * Retrieval stub — returns relevant policy chunks.
 * In the POC this always returns an empty array because no policies are indexed.
 * The LLM will fall back to general knowledge and clearly note this.
 */

async function retrieveRelevantChunks(query, topK = 10) {
  return [];
}

module.exports = { retrieveRelevantChunks };
