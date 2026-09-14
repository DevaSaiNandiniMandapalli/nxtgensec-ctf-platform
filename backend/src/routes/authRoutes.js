const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { getMyStats } = require("../controllers/statsController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.get("/stats", requireAuth, getMyStats);

module.exports = router;