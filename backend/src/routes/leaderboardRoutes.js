const express = require("express");

const { getLeaderboard } = require("../controllers/leaderboardController");

const router = express.Router();

router.get(
  "/:eventId/leaderboard",
  getLeaderboard
);

module.exports = router;