const crypto = require("crypto");

const { pool } = require("../db/pool");
const { submitFlagSchema } = require("../validators/submissionValidators");

function hashFlag(flag) {
  return crypto
    .createHash("sha256")
    .update(flag, "utf8")
    .digest("hex");
}

async function submitFlag(req, res, next) {
  try {
    const { challengeId } = req.params;

    const validation = submitFlagSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid submission",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const submittedFlag = validation.data.flag;

    const challengeResult = await pool.query(
      `
      SELECT
        id,
        event_id,
        title,
        points,
        flag_hash
      FROM challenges
      WHERE id = $1
        AND state = 'PUBLISHED'
        AND (release_at IS NULL OR release_at <= NOW())
        AND (archive_at IS NULL OR archive_at > NOW())
      LIMIT 1
      `,
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Challenge not found or unavailable",
      });
    }

    const challenge = challengeResult.rows[0];
    const submittedHash = hashFlag(submittedFlag);

    const isCorrect = submittedHash === challenge.flag_hash;

    await pool.query(
      `
      INSERT INTO submissions (
        user_id,
        challenge_id,
        submitted_flag,
        is_correct
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        req.user.id,
        challenge.id,
        submittedFlag,
        isCorrect,
      ]
    );

    if (!isCorrect) {
      return res.json({
        correct: false,
        message: "Incorrect flag",
      });
    }

    const solveResult = await pool.query(
      `
      INSERT INTO solves (
        user_id,
        challenge_id,
        points_awarded
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, challenge_id)
      DO NOTHING
      RETURNING
        id,
        points_awarded,
        solved_at
      `,
      [
        req.user.id,
        challenge.id,
        challenge.points,
      ]
    );

    if (solveResult.rows.length === 0) {
      return res.json({
        correct: true,
        already_solved: true,
        message: "Correct flag. Challenge already solved.",
        points_awarded: 0,
      });
    }

    return res.json({
      correct: true,
      already_solved: false,
      message: "Correct flag",
      points_awarded: solveResult.rows[0].points_awarded,
      solved_at: solveResult.rows[0].solved_at,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitFlag,
};