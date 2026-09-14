const express = require("express");

const {
  listEventDays,
  createEventDay,
} = require("../controllers/eventDayController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/:eventId/days", listEventDays);

// Admin only
router.post(
  "/:eventId/days",
  requireAuth,
  requireAdmin,
  createEventDay
);

module.exports = router;
