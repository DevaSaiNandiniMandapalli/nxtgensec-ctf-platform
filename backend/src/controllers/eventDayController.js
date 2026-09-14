const { pool } = require("../db/pool");
const { createEventDaySchema } = require("../validators/eventDayValidators");

async function listEventDays(req, res, next) {
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
        id,
        event_id,
        day_number,
        name,
        start_at,
        end_at,
        created_at,
        updated_at
      FROM event_days
      WHERE event_id = $1
      ORDER BY day_number ASC
      `,
      [eventId]
    );

    return res.json({
      days: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function createEventDay(req, res, next) {
  try {
    const { eventId } = req.params;

    const validation = createEventDaySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid event day data",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      day_number,
      name,
      start_at,
      end_at,
    } = validation.data;

    if (new Date(end_at) <= new Date(start_at)) {
      return res.status(400).json({
        error: "end_at must be after start_at",
      });
    }

    const eventResult = await pool.query(
      `
      SELECT
        id,
        start_at,
        end_at
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

    const event = eventResult.rows[0];

    const dayStart = new Date(start_at);
    const dayEnd = new Date(end_at);
    const eventStart = new Date(event.start_at);
    const eventEnd = new Date(event.end_at);

    if (dayStart < eventStart || dayEnd > eventEnd) {
      return res.status(400).json({
        error: "Event day must be completely inside the event time range",
      });
    }

    const existingDay = await pool.query(
      `
      SELECT id
      FROM event_days
      WHERE event_id = $1
        AND day_number = $2
      LIMIT 1
      `,
      [eventId, day_number]
    );

    if (existingDay.rows.length > 0) {
      return res.status(409).json({
        error: "This event day already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO event_days (
        event_id,
        day_number,
        name,
        start_at,
        end_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        event_id,
        day_number,
        name,
        start_at,
        end_at,
        created_at,
        updated_at
      `,
      [
        eventId,
        day_number,
        name || null,
        start_at,
        end_at,
      ]
    );

    return res.status(201).json({
      message: "Event day created successfully",
      day: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This event day already exists",
      });
    }

    next(error);
  }
}

module.exports = {
  listEventDays,
  createEventDay,
};