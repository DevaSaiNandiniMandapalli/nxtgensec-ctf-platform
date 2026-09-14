const express = require("express");

const {
  listEvents,
  getEventBySlug,
  createEvent,
} = require("../controllers/eventController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", listEvents);
router.get("/:slug", getEventBySlug);

// Admin only
router.post("/", requireAuth, requireAdmin, createEvent);

module.exports = router;