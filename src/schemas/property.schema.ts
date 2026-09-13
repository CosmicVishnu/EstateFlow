import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const propertyIdParamSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Property ID is required' })
      .regex(objectIdRegex, 'Invalid Property ID format. Must be a 24-character hexadecimal string'),
  }),
});

export const createPropertySchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(5, 'Description must be at least 5 characters long'),
    price: z
      .number({ required_error: 'Price is required' })
      .positive('Price must be a positive number'),
    location: z
      .string({ required_error: 'Location is required' })
      .trim()
      .min(2, 'Location must be at least 2 characters long'),
    status: z.enum(['available', 'sold']).optional().default('available'),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Property ID is required' })
      .regex(objectIdRegex, 'Invalid Property ID format'),
  }),
  body: z
    .object({
      title: z.string().trim().min(3, 'Title must be at least 3 characters long').max(200).optional(),
      description: z.string().trim().min(5, 'Description must be at least 5 characters long').optional(),
      price: z.number().positive('Price must be a positive number').optional(),
      location: z.string().trim().min(2, 'Location must be at least 2 characters long').optional(),
      status: z.enum(['available', 'sold']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

export const queryPropertySchema = z.object({
  query: z.object({
    status: z.enum(['available', 'sold']).optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'minPrice must be a valid number')
      .transform(Number)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'maxPrice must be a valid number')
      .transform(Number)
      .optional(),
    location: z.string().trim().optional(),
    search: z.string().trim().optional(),
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

export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>['body'];
export type QueryPropertyInput = z.infer<typeof queryPropertySchema>['query'];
