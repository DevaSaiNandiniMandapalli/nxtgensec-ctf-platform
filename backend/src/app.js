require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { testDatabaseConnection } = require("./db/pool");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const eventDayRoutes = require("./routes/eventDayRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

app.disable("x-powered-by");

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Global rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// JSON request body
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", eventDayRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/challenges", submissionRoutes);
app.use("/api/events", leaderboardRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "NXTGENSEC CTF API",
    version: "1.0.0",
    status: "running",
  });
});

// Database health check
app.get("/health", async (req, res) => {
  try {
    await testDatabaseConnection();

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error);

    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;