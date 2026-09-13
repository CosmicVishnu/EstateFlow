import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError, ZodSchema } from 'zod';

type SupportedSchema =
  | AnyZodObject
  | ZodEffects<AnyZodObject>
  | ZodEffects<ZodSchema<any>>
  | ZodSchema<any>;

export const validate = (schema: SupportedSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (result && typeof result === 'object') {
        if ('body' in result && result.body !== undefined) {
          req.body = result.body;
        }
        if ('query' in result && result.query !== undefined) {
          (req as any).query = result.query;
        }
        if ('params' in result && result.params !== undefined) {
          req.params = result.params;
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};

export default validate;
