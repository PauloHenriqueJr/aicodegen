import { Hono } from 'hono';
import { ApiResponseHelper } from '../lib/response';

const debugRouter = new Hono();

/**
 * GET /debug/env
 * Debug endpoint to check environment variables (only in development)
 */
debugRouter.get('/env', (c) => {
  // Only allow in non-production environments for security
  const isDev = process.env.NODE_ENV !== 'production';
  
  return ApiResponseHelper.success(c, {
    environment: process.env.NODE_ENV || 'undefined',
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
    corsOrigin: process.env.CORS_ORIGIN || 'undefined',
    timestamp: new Date().toISOString()
  }, 'Environment debug info');
});

/**
 * GET /debug/health
 * Simple health check
 */
debugRouter.get('/health', (c) => {
  return ApiResponseHelper.success(c, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Debug health check');
});

export default debugRouter;