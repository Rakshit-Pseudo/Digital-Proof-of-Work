const { z } = require('zod');

const createCertificateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    issuingOrganization: z.string().min(1, 'Issuing organization is required'),
    issueDate: z.coerce.date(),
    expiryDate: z.coerce.date().optional(),
  }).refine(
    (data) => !data.expiryDate || data.expiryDate > data.issueDate,
    {
      message: 'Expiry date must be after issue date',
      path: ['expiryDate'],
    }
  ),
});

const certificateIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid certificate ID'),
  }),
});

const userCertificatesSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

module.exports = {
  createCertificateSchema,
  certificateIdSchema,
  userCertificatesSchema,
};
