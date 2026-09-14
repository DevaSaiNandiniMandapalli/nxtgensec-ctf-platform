const { pool } = require("../db/pool");

async function getMyStats(req, res, next) {
  try {
    const userId = req.user.id;

    const statsResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT s.id)::integer AS solves,
        COALESCE(SUM(s.points_awarded), 0)::integer AS points
      FROM solves s
      WHERE s.user_id = $1
      `,
      [userId]
    );

    const submissionsResult = await pool.query(
      `
      SELECT
        COUNT(*)::integer AS submissions,
        COUNT(*) FILTER (WHERE is_correct = TRUE)::integer AS correct_submissions,
        COUNT(*) FILTER (WHERE is_correct = FALSE)::integer AS incorrect_submissions
      FROM submissions
      WHERE user_id = $1
      `,
      [userId]
    );

    const rankResult = await pool.query(
      `
      SELECT rank
      FROM (
        SELECT
          u.id,
          RANK() OVER (
            ORDER BY
              COALESCE(SUM(s.points_awarded), 0) DESC,
              COUNT(s.id) DESC,
              u.username ASC
          ) AS rank
        FROM users u
        LEFT JOIN solves s
          ON s.user_id = u.id
        WHERE u.is_active = TRUE
        GROUP BY u.id, u.username
      ) rankings
      WHERE id = $1
      `,
      [userId]
    );

    const stats = statsResult.rows[0];
    const submissions = submissionsResult.rows[0];

    return res.json({
      stats: {
        points: stats.points,
        solves: stats.solves,
        rank: rankResult.rows.length > 0
          ? Number(rankResult.rows[0].rank)
          : null,
        submissions: submissions.submissions,
        correct_submissions: submissions.correct_submissions,
        incorrect_submissions: submissions.incorrect_submissions,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyStats,
};