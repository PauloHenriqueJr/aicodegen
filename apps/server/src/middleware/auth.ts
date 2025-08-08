import type { Context, Next } from 'hono';
import { AuthService } from '../lib/auth';
import { ApiResponseHelper } from '../lib/response';
import type { SessionUser } from '../types';

// Extend Hono's context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser;
  }
}

/**
 * Authentication middleware
 * Validates session token and adds user to context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const sessionToken = c.req.header('X-Session-Token');
  
  // Try both Authorization header and X-Session-Token header
  let token: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (sessionToken) {
    token = sessionToken;
  }

  if (!token) {
    return ApiResponseHelper.unauthorized(c, 'Authentication token required');
  }

  const user = await AuthService.getUserFromSession(token);
  
  if (!user) {
    return ApiResponseHelper.unauthorized(c, 'Invalid or expired session');
  }

  // Add user to context
  c.set('user', user);
  
  await next();
};

/**
 * Optional authentication middleware
 * Adds user to context if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const sessionToken = c.req.header('X-Session-Token');
  
  let token: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (sessionToken) {
    token = sessionToken;
  }

  if (token) {
    const user = await AuthService.getUserFromSession(token);
    if (user) {
      c.set('user', user);
    }
  }
  
  await next();
};

/**
 * Plan requirement middleware
 * Requires user to have specific plan level
 */
export const requirePlan = (requiredPlan: 'PRO' | 'ENTERPRISE') => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return ApiResponseHelper.unauthorized(c, 'Authentication required');
    }

    const planHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
    const userLevel = planHierarchy[user.plan];
    const requiredLevel = planHierarchy[requiredPlan];

    if (userLevel < requiredLevel) {
      return ApiResponseHelper.forbidden(
        c,
        `This feature requires ${requiredPlan} plan or higher`
      );
    }

    await next();
  };
};

/**
 * Credits requirement middleware
 * Requires user to have sufficient credits
 */
export const requireCredits = (amount: number = 1) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return ApiResponseHelper.unauthorized(c, 'Authentication required');
    }

    const hasCredits = await AuthService.checkCredits(user.id, amount);
    
    if (!hasCredits) {
      return ApiResponseHelper.forbidden(
        c,
        'Insufficient credits. Please upgrade your plan or purchase more credits.'
      );
    }

    await next();
  };
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    
    // Use user ID if authenticated, otherwise use IP
    const identifier = user ? `user:${user.id}` : `ip:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(identifier);
    
    if (!entry || entry.resetTime < windowStart) {
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(identifier, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return ApiResponseHelper.error(
        c,
        'Rate limit exceeded. Please try again later.',
        429
      );
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    }

    await next();
  };
};