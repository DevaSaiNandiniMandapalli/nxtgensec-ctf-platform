const { pool } = require("../db/pool");
const { createEventSchema } = require("../validators/eventValidators");

async function listEvents(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        slug,
        description,
        status,
        start_at,
        end_at,
        challenges_per_day_min,
        challenges_per_day_max
      FROM events
      WHERE status <> 'ARCHIVED'
      ORDER BY start_at ASC, created_at ASC
    `);

    return res.json({
      events: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getEventBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        description,
        status,
        start_at,
        end_at,
        challenges_per_day_min,
        challenges_per_day_max
      FROM events
      WHERE slug = $1
        AND status <> 'ARCHIVED'
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    return res.json({
      event: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid event data",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      name,
      slug,
      description,
      start_at,
      end_at,
      challenges_per_day_min,
      challenges_per_day_max,
    } = result.data;

    if (new Date(end_at) <= new Date(start_at)) {
      return res.status(400).json({
        error: "end_at must be after start_at",
      });
    }

    if (challenges_per_day_max < challenges_per_day_min) {
      return res.status(400).json({
        error: "challenges_per_day_max must be greater than or equal to challenges_per_day_min",
      });
    }

    const existingEvent = await pool.query(
      `
      SELECT id
      FROM events
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (existingEvent.rows.length > 0) {
      return res.status(409).json({
        error: "Event slug is already registered",
      });
    }

    const resultInsert = await pool.query(
      `
      INSERT INTO events (
        name,
        slug,
        description,
        status,
        start_at,
        end_at,
        challenges_per_day_min,
        challenges_per_day_max,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        'DRAFT',
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING
        id,
        name,
        slug,
        description,
        status,
        start_at,
        end_at,
        challenges_per_day_min,
        challenges_per_day_max,
        created_by,
        created_at,
        updated_at
      `,
      [
        name,
        slug,
        description,
        start_at,
        end_at,
        challenges_per_day_min,
        challenges_per_day_max,
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Event created successfully",
      event: resultInsert.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Event slug is already registered",
      });
    }

    next(error);
  }
}

module.exports = {
  listEvents,
  getEventBySlug,
  createEvent,
};