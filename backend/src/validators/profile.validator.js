const { z } = require('zod');

const educationSchema = z
  .object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    fieldOfStudy: z.string().optional(),
    startYear: z.coerce.number().int().min(1950).max(2100),
    endYear: z.coerce.number().int().min(1950).max(2100),
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: 'End year must be greater than or equal to start year',
    path: ['endYear'],
  });

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiency: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .default('intermediate'),
});

const createProfileSchema = z.object({
  body: z.object({
    headline: z.string().min(1, 'Headline is required'),
    bio: z.string().min(1, 'Bio is required'),
    education: z.array(educationSchema).optional(),
    skills: z.array(skillSchema).optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    headline: z.string().min(1).optional(),
    bio: z.string().min(1).optional(),
    education: z.array(educationSchema).optional(),
    skills: z.array(skillSchema).optional(),
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

module.exports = {
  createProfileSchema,
  updateProfileSchema,
  userIdParamSchema,
};
