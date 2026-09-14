const express = require("express");

const { submitFlag } = require("../controllers/submissionController");
const {
  requireAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:challengeId/submit",
  requireAuth,
  submitFlag
);

module.exports = router;