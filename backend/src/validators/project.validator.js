const { z } = require('zod');

const githubUrlRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/;

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    techStack: z
      .union([z.array(z.string()), z.string()])
      .transform((val) => (Array.isArray(val) ? val : JSON.parse(val)))
      .pipe(z.array(z.string()).min(1, 'At least one tech stack item is required')),
    githubUrl: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : val),
      z
        .string()
        .regex(githubUrlRegex, 'GitHub URL must match https://github.com/{owner}/{repo}')
        .optional()
    ),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    techStack: z
      .union([z.array(z.string()), z.string()])
      .transform((val) => (Array.isArray(val) ? val : JSON.parse(val)))
      .optional(),
    githubUrl: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : val),
      z
        .string()
        .regex(githubUrlRegex, 'GitHub URL must match https://github.com/{owner}/{repo}')
        .optional()
    ),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
});

const projectIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
});

const userProjectsSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  userProjectsSchema,
};
