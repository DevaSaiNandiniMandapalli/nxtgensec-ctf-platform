const { z } = require("zod");

const createEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Event name must be at least 3 characters")
    .max(120, "Event name is too long"),

  slug: z
    .string()
    .trim()
    .min(3, "Event slug must be at least 3 characters")
    .max(140, "Event slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string()
    .trim()
    .max(5000, "Description is too long")
    .optional()
    .default(""),

  start_at: z.string().datetime({
    message: "start_at must be a valid ISO datetime",
  }),

  end_at: z.string().datetime({
    message: "end_at must be a valid ISO datetime",
  }),

  challenges_per_day_min: z
    .number()
    .int()
    .min(1)
    .max(100),

  challenges_per_day_max: z
    .number()
    .int()
    .min(1)
    .max(100),
});

module.exports = {
  createEventSchema,
};