const { z } = require("zod");

const createEventDaySchema = z.object({
  day_number: z
    .number()
    .int()
    .min(1, "Day number must be at least 1")
    .max(31, "Day number is too large"),

  name: z
    .string()
    .trim()
    .max(120, "Day name is too long")
    .optional(),

  start_at: z.string().datetime({
    message: "start_at must be a valid ISO datetime",
  }),

  end_at: z.string().datetime({
    message: "end_at must be a valid ISO datetime",
  }),
});

module.exports = {
  createEventDaySchema,
};