const { z } = require("zod");

const challengeCategories = [
  "WEB",
  "CRYPTOGRAPHY",
  "FORENSICS",
  "OSINT",
  "LINUX",
  "NETWORKING",
  "REVERSE_ENGINEERING",
  "MISCELLANEOUS",
];

const difficultyLevels = [
  "BEGINNER",
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
];

const createChallengeSchema = z.object({
  event_id: z.string().uuid("event_id must be a valid UUID"),

  event_day_id: z
    .string()
    .uuid("event_day_id must be a valid UUID")
    .nullable()
    .optional(),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(160, "Title is too long"),

  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(180, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  category: z.enum(challengeCategories),

  difficulty: z.enum(difficultyLevels),

  points: z
    .number()
    .int()
    .positive("Points must be greater than 0"),

  flag: z
    .string()
    .min(1, "Flag is required"),

  hint: z
    .string()
    .trim()
    .optional()
    .nullable(),

  author_name: z
    .string()
    .trim()
    .max(100, "Author name is too long")
    .optional()
    .nullable(),

  release_at: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  archive_at: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  is_final: z
    .boolean()
    .default(false),

  final_order: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .nullable(),

  attachment_url: z
    .string()
    .url("attachment_url must be a valid URL")
    .optional()
    .nullable(),
});

module.exports = {
  createChallengeSchema,
};