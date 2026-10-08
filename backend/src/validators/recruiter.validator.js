const { z } = require('zod');

exports.jobSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    minCgpa: z.number().min(0).max(10).optional().nullable(),
    departments: z.array(z.string()).min(1, 'At least one department is required'),
    graduationYears: z.array(z.number()).min(1, 'At least one graduation year is required'),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date' }),
    openings: z.number().min(1).optional().nullable(),
    employmentType: z.enum(['FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'CONTRACT']).optional()
  })
});

exports.companySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    industry: z.string().optional().nullable(),
    location: z.string().optional().nullable()
  })
});

exports.applicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']),
    note: z.string().optional()
  })
});

exports.applicationNotesSchema = z.object({
  body: z.object({
    notes: z.string().max(1000, 'Notes must be at most 1000 characters').nullable()
  })
});

exports.companySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
    industry: z.string().optional().nullable(),
    location: z.string().optional().nullable()
  })
});

exports.profileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional().nullable().or(z.literal(''))
  })
});

