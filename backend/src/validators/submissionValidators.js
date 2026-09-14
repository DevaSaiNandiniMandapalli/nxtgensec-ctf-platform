const { z } = require("zod");

const submitFlagSchema = z.object({
  flag: z.string().min(1, "Flag is required").max(500),
});

module.exports = {
  submitFlagSchema,
};
