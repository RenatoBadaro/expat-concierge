/**
 * V2 User Context Service
 * Returns a merged user context object combining permissions, corporate context,
 * and profile. In production, this would fetch from HR/IAM APIs.
 */

const { USERS_V2 } = require("../data/usersV2");

// In-memory store (mirrors the mock file; supports runtime edits via API)
let usersStore = JSON.parse(JSON.stringify(USERS_V2));

/**
 * Get full user context by userId.
 * Returns { id, identity, permissions, corporateContext, profile } or null.
 */
function getUserContext(userId) {
  const user = usersStore.find((u) => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    identity: { ...user.identity },
    permissions: { ...user.permissions },
    corporateContext: { ...user.corporateContext },
    profile: JSON.parse(JSON.stringify(user.profile)),
  };
}

/**
 * List all users (minimal view for UI — no sensitive financial details).
 */
function listUsers() {
  return usersStore.map((u) => ({
    id: u.id,
    name: u.identity.name,
    avatar: u.identity.avatar,
    assignmentType: u.permissions.assignmentType,
    homeCountry: u.corporateContext.homeCountry,
    hostCountry: u.corporateContext.hostCountry,
    assignmentStage: u.profile.timeline.assignmentStage,
  }));
}

/**
 * Upsert (create or update) a user. Returns the saved user.
 */
function upsertUser(userData) {
  const idx = usersStore.findIndex((u) => u.id === userData.id);
  if (idx >= 0) {
    usersStore[idx] = JSON.parse(JSON.stringify(userData));
    return usersStore[idx];
  }
  const newUser = JSON.parse(JSON.stringify(userData));
  usersStore.push(newUser);
  return newUser;
}

/**
 * Delete a user by id. Returns true if deleted.
 */
function deleteUser(userId) {
  const idx = usersStore.findIndex((u) => u.id === userId);
  if (idx < 0) return false;
  usersStore.splice(idx, 1);
  return true;
}

/**
 * Reset store back to the original mock data (useful for tests).
 */
function resetStore() {
  usersStore = JSON.parse(JSON.stringify(USERS_V2));
}

module.exports = { getUserContext, listUsers, upsertUser, deleteUser, resetStore };
