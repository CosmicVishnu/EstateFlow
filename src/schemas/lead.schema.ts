import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const leadIdParamSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Lead ID is required' })
      .regex(objectIdRegex, 'Invalid Lead ID format. Must be a 24-character hexadecimal string'),
  }),
});

export const createLeadSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address format'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(7, 'Phone number must be at least 7 characters long'),
    notes: z.string().trim().optional(),
    propertyId: z
      .string()
      .regex(objectIdRegex, 'Invalid propertyId format. Must be a 24-character hexadecimal string')
      .optional(),
    status: z
      .enum(['new', 'contacted', 'qualified', 'lost', 'closed'])
      .optional()
      .default('new'),
  }),
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'lost', 'closed']).optional(),
    propertyId: z
      .string()
      .regex(objectIdRegex, 'Invalid propertyId format')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'page must be a positive integer')
      .transform(Number)
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'limit must be a positive integer')
      .transform(Number)
      .optional()
      .default('10'),
  }),
});

export const assignLeadPropertySchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Lead ID is required' })
      .regex(objectIdRegex, 'Invalid Lead ID format'),
  }),
  body: z.object({
    propertyId: z
      .string({ required_error: 'Property ID is required' })
      .regex(objectIdRegex, 'Invalid Property ID format'),
  }),
});

export const updateLeadStatusSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Lead ID is required' })
      .regex(objectIdRegex, 'Invalid Lead ID format'),
  }),
  body: z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'lost', 'closed'], {
      required_error: 'Status is required',
    }),
  }),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>['body'];
export type GetLeadsQueryInput = z.infer<typeof getLeadsQuerySchema>['query'];
export type AssignLeadPropertyInput = z.infer<typeof assignLeadPropertySchema>['body'];
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>['body'];
