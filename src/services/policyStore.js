/**
 * Policy Store stub — returns indexed policies.
 * In the POC this is empty; plug in a real store when policies are uploaded.
 */

let policies = [];

function getPolicies() {
  return policies;
}

function setPolicies(data) {
  policies = data;
}

module.exports = { getPolicies, setPolicies };
