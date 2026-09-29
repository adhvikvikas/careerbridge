const { z } = require('zod');

exports.updateProfileSchema = z.object({
  body: z.object({
    branch: z.string().optional(),
    cgpa: z.number().min(0).max(10).optional(),
    graduationYear: z.number().min(2000).max(2100).optional(),
    resumeUrl: z.string().url().optional().or(z.literal('')),
    backlogs: z.number().min(0).optional()
  })
});
