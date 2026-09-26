const { z } = require('zod');

exports.rejectSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Rejection reason must be at least 5 characters').max(500, 'Rejection reason must be at most 500 characters'),
  })
});
