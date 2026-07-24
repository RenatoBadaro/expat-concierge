/**
 * V2 Users REST API
 * GET    /v2/users          — list all users (minimal)
 * GET    /v2/users/:id      — get full user context
 * PUT    /v2/users/:id      — create or update user
 * DELETE /v2/users/:id      — delete user
 */

const express = require("express");
const {
  getUserContext,
  listUsers,
  upsertUser,
  deleteUser,
} = require("../services/userContextServiceV2");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(listUsers());
});

router.get("/:id", (req, res) => {
  const ctx = getUserContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "User not found." });
  res.json(ctx);
});

router.put("/:id", (req, res) => {
  const userData = req.body;
  if (!userData || !userData.id) {
    return res.status(400).json({ error: "User data with id is required." });
  }
  if (userData.id !== req.params.id) {
    return res.status(400).json({ error: "URL id and body id must match." });
  }
  const saved = upsertUser(userData);
  res.json(saved);
});

router.delete("/:id", (req, res) => {
  const ok = deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: "User not found." });
  res.json({ deleted: true });
});

module.exports = router;
