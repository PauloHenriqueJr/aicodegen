import type { Context, Next } from 'hono';
import { z } from 'zod';
import { ApiResponseHelper } from '../lib/response';

/**
 * Validation middleware for request body
 */
export const validateBody = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      
      // Add validated data to context
      c.set('validatedData', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(c, error.errors);
      }
      
      return ApiResponseHelper.error(c, 'Invalid request body');
    }
  };
};

/**
 * Validation middleware for query parameters
 */
export const validateQuery = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      
      // Add validated data to context
      c.set('validatedQuery', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(c, error.errors);
      }
      
      return ApiResponseHelper.error(c, 'Invalid query parameters');
    }
  };
};

/**
 * Validation middleware for path parameters
 */
export const validateParams = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      const validatedData = schema.parse(params);
      
      // Add validated data to context
      c.set('validatedParams', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(c, error.errors);
      }
      
      return ApiResponseHelper.error(c, 'Invalid path parameters');
    }
  };
};

// Common parameter schemas
export const IdParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('10'),
});

// Extend Hono's context to include validated data
declare module 'hono' {
  interface ContextVariableMap {
    validatedData: any;
    validatedQuery: any;
    validatedParams: any;
  }
}