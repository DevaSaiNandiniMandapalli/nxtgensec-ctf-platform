const { pool } = require("../db/pool");

async function getLeaderboard(req, res, next) {
  try {
    const { eventId } = req.params;

    const eventResult = await pool.query(
      `
      SELECT id
      FROM events
      WHERE id = $1
        AND status <> 'ARCHIVED'
      LIMIT 1
      `,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.username,
        COUNT(s.id)::integer AS solves,
        COALESCE(SUM(s.points_awarded), 0)::integer AS points
      FROM users u
      INNER JOIN solves s
        ON s.user_id = u.id
      INNER JOIN challenges c
        ON c.id = s.challenge_id
      WHERE c.event_id = $1
        AND u.is_active = TRUE
      GROUP BY
        u.id,
        u.username
      ORDER BY
        points DESC,
        solves DESC,
        u.username ASC
      `,
      [eventId]
    );

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      user_id: row.user_id,
      username: row.username,
      solves: row.solves,
      points: row.points,
    }));

    return res.json({
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeaderboard,
};
