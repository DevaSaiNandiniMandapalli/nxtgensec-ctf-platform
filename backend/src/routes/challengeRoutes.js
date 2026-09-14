const express = require("express");

const {
  listChallenges,
  getChallengeBySlug,
  getChallengeStatus,
  getChallengeArtifact,
  createChallenge,
  publishChallenge,
  archiveChallenge,
} = require("../controllers/challengeController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/event/:eventId", listChallenges);

router.get(
  "/:id/status",
  requireAuth,
  getChallengeStatus
);

router.get(
  "/:id/artifact",
  getChallengeArtifact
);

router.get("/:slug", getChallengeBySlug);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createChallenge
);

router.post(
  "/:id/publish",
  requireAuth,
  requireAdmin,
  publishChallenge
);

router.post(
  "/:id/archive",
  requireAuth,
  requireAdmin,
  archiveChallenge
);

module.exports = router;