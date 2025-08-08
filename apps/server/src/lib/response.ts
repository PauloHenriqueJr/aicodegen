import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import type { ApiResponse, PaginatedResponse } from '../types';

export class ApiResponseHelper {
  /**
   * Send a successful response
   */
  static success<T>(c: Context, data?: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return c.json(response);
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    c: Context,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination,
      message,
    };
    return c.json(response);
  }

  /**
   * Send an error response
   */
  static error(
    c: Context,
    error: string,
    statusCode: number = 400,
    data?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error,
      data,
    };
    return c.json(response, statusCode);
  }

  /**
   * Send a validation error response
   */
  static validationError(c: Context, errors: any): Response {
    return ApiResponseHelper.error(c, 'Validation failed', 422, { errors });
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(c: Context, message: string = 'Unauthorized'): Response {
    return ApiResponseHelper.error(c, message, 401);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(c: Context, message: string = 'Forbidden'): Response {
    return ApiResponseHelper.error(c, message, 403);
  }

  /**
   * Send a not found response
   */
  static notFound(c: Context, message: string = 'Resource not found'): Response {
    return ApiResponseHelper.error(c, message, 404);
  }

  /**
   * Send a conflict response
   */
  static conflict(c: Context, message: string = 'Conflict'): Response {
    return ApiResponseHelper.error(c, message, 409);
  }

  /**
   * Send an internal server error response
   */
  static internalError(c: Context, message: string = 'Internal server error'): Response {
    return ApiResponseHelper.error(c, message, 500);
  }

  /**
   * Handle async route errors
   */
  static async handleAsync<T>(
    c: Context,
    asyncFn: () => Promise<T>
  ): Promise<Response | T> {
    try {
      return await asyncFn();
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        return ApiResponseHelper.internalError(c, error.message);
      }
      
      return ApiResponseHelper.internalError(c, 'An unexpected error occurred');
    }
  }
}

// Convenience function for async error handling
export const asyncHandler = (
  fn: (c: Context) => Promise<Response>
) => {
  return async (c: Context): Promise<Response> => {
    return ApiResponseHelper.handleAsync(c, () => fn(c)) as Promise<Response>;
  };
};