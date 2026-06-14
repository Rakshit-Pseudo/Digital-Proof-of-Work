import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'verifier', 'recruiter', 'admin']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  bio: z.string().min(1, 'Bio is required'),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.string().min(1, 'At least one tech is required'),
  githubUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(val),
      'Invalid GitHub URL'
    ),
});

export const certificateSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    issuingOrganization: z.string().min(1, 'Organization is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.expiryDate) return true;
      return new Date(data.expiryDate) > new Date(data.issueDate);
    },
    { message: 'Expiry date must be after issue date', path: ['expiryDate'] }
  );

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type ProjectForm = z.infer<typeof projectSchema>;
export type CertificateForm = z.infer<typeof certificateSchema>;
