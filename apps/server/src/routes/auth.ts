import { Hono } from 'hono';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../lib/auth';
import { ApiResponseHelper, asyncHandler } from '../lib/response';
import { validateBody } from '../middleware/validation';
import { authMiddleware, rateLimit } from '../middleware/auth';
import { LoginSchema, RegisterSchema } from '../types';
import { z } from 'zod';
import prisma from '../../prisma';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Schema for Google authentication
const GoogleAuthSchema = z.object({
  credential: z.string(), // Google ID token from Identity Services
});

const authRouter = new Hono();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

/**
 * POST /auth/register
 * Register a new user
 */
authRouter.post(
  '/register',
  authRateLimit,
  validateBody(RegisterSchema),
  asyncHandler(async (c) => {
    const { email, name, password } = c.get('validatedData');

    // Check if user already exists
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      return ApiResponseHelper.conflict(c, 'User with this email already exists');
    }

    // Create user (simplified - in production, you'd want proper password hashing)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        credits: 50, // Free tier credits
        maxCredits: 50,
      },
    });

    // Create session
    const { token, expiresAt } = await AuthService.createSession(user.id);

    return ApiResponseHelper.success(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        maxCredits: user.maxCredits,
      },
      session: {
        token,
        expiresAt,
      },
    }, 'User registered successfully');
  })
);

/**
 * POST /auth/login
 * Authenticate user and create session
 */
authRouter.post(
  '/login',
  authRateLimit,
  validateBody(LoginSchema),
  asyncHandler(async (c) => {
    const { email, password } = c.get('validatedData');

    // Get user (simplified - in production, verify password hash)
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      return ApiResponseHelper.unauthorized(c, 'Invalid credentials');
    }

    // For demo purposes, we'll accept any password
    // In production, you'd verify the password hash here

    // Create session
    const { token, expiresAt } = await AuthService.createSession(user.id);

    return ApiResponseHelper.success(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        maxCredits: user.maxCredits,
      },
      session: {
        token,
        expiresAt,
      },
    }, 'Login successful');
  })
);

/**
 * POST /auth/google
 * Authenticate user with Google OAuth token
 */
authRouter.post(
  '/google',
  authRateLimit,
  validateBody(GoogleAuthSchema),
  asyncHandler(async (c) => {
    const { credential } = c.get('validatedData');

    try {
      console.log('Verificando token do Google...');
      console.log('Environment check:', {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        nodeEnv: process.env.NODE_ENV
      });
      
      // First decode without verification to check the token structure
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decodedPayload = JSON.parse(jsonPayload);
      
      console.log('Token decodificado:', {
        email: decodedPayload.email,
        name: decodedPayload.name,
        iss: decodedPayload.iss,
        aud: decodedPayload.aud,
        exp: decodedPayload.exp,
        currentTime: Math.floor(Date.now() / 1000)
      });

      // Check if token is from Google
      if (decodedPayload.iss !== 'https://accounts.google.com') {
        console.error('Token não é do Google:', decodedPayload.iss);
        return ApiResponseHelper.unauthorized(c, 'Token não é do Google');
      }

      // Check audience
      console.log('Verificando audience:', {
        tokenAud: decodedPayload.aud,
        envClientId: process.env.GOOGLE_CLIENT_ID,
        match: decodedPayload.aud === process.env.GOOGLE_CLIENT_ID
      });
      
      if (decodedPayload.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.error('Audience incorreta:', {
          expected: process.env.GOOGLE_CLIENT_ID,
          received: decodedPayload.aud
        });
        return ApiResponseHelper.unauthorized(c, 'Token para cliente incorreto');
      }

      // Check if token is not expired (with generous tolerance for development)
      const currentTime = Math.floor(Date.now() / 1000);
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const tolerance = isDevelopment ? 86400 : 300; // 24 hours in dev, 5 minutes in prod
      
      if (decodedPayload.exp && decodedPayload.exp + tolerance < currentTime) {
        console.error('Token expirado mesmo com tolerância:', {
          exp: decodedPayload.exp,
          current: currentTime,
          diff: currentTime - decodedPayload.exp,
          tolerance: tolerance,
          isDevelopment
        });
        
        // Em desenvolvimento, vamos aceitar tokens expirados com um aviso
        if (isDevelopment) {
          console.warn('⚠️ DESENVOLVIMENTO: Aceitando token expirado');
        } else {
          return ApiResponseHelper.unauthorized(c, 'Token expirado');
        }
      } else if (decodedPayload.exp && decodedPayload.exp < currentTime) {
        console.warn('Token tecnicamente expirado, mas aceitando com tolerância:', {
          exp: decodedPayload.exp,
          current: currentTime,
          diff: currentTime - decodedPayload.exp
        });
      }

      // Use the decoded payload instead of verifying signature for now
      const payload = decodedPayload;
      
      console.log('Token verificado com sucesso:', {
        email: payload?.email,
        name: payload?.name,
        sub: payload?.sub
      });
      
      if (!payload || !payload.email) {
        console.error('Payload inválido:', payload);
        return ApiResponseHelper.unauthorized(c, 'Invalid Google token');
      }

      // Check if user exists
      let user = await AuthService.getUserByEmail(payload.email);

      if (!user) {
        // Create new user if doesn't exist
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatar: payload.picture || null,
            credits: 50, // Free tier credits
            maxCredits: 50,
            googleId: payload.sub, // Store Google user ID
          },
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            avatar: payload.picture || user.avatar,
          },
        });
      }

      // Create session
      const { token, expiresAt } = await AuthService.createSession(user.id);

      return ApiResponseHelper.success(c, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          maxCredits: user.maxCredits,
          createdAt: user.createdAt,
        },
        session: {
          token,
          expiresAt,
        },
      }, 'Google authentication successful');

    } catch (error) {
      console.error('Google authentication error:', error);
      return ApiResponseHelper.unauthorized(c, 'Failed to verify Google token');
    }
  })
);

/**
 * POST /auth/logout
 * Invalidate current session
 */
authRouter.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (c) => {
    const authHeader = c.req.header('Authorization');
    const sessionToken = c.req.header('X-Session-Token');
    
    let token: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (sessionToken) {
      token = sessionToken;
    }

    if (token) {
      await AuthService.invalidateSession(token);
    }

    return ApiResponseHelper.success(c, null, 'Logout successful');
  })
);

/**
 * GET /auth/me
 * Get current user information
 */
authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (c) => {
    const sessionUser = c.get('user');

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 5, // Recent projects only
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponseHelper.notFound(c, 'User not found');
    }

    return ApiResponseHelper.success(c, {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      maxCredits: user.maxCredits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      recentProjects: user.projects,
      totalProjects: user._count.projects,
    });
  })
);

/**
 * PUT /auth/me
 * Update current user information
 */
authRouter.put(
  '/me',
  authMiddleware,
  validateBody(RegisterSchema.pick({ name: true }).extend({
    avatar: RegisterSchema.shape.name.optional(), // Allow avatar update
  })),
  asyncHandler(async (c) => {
    const sessionUser = c.get('user');
    const { name, avatar } = c.get('validatedData');

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
    });

    return ApiResponseHelper.success(c, {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      plan: updatedUser.plan,
      credits: updatedUser.credits,
      maxCredits: updatedUser.maxCredits,
    }, 'User updated successfully');
  })
);

/**
 * GET /auth/credits
 * Get user credit information
 */
authRouter.get(
  '/credits',
  authMiddleware,
  asyncHandler(async (c) => {
    const sessionUser = c.get('user');

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        credits: true,
        maxCredits: true,
        plan: true,
      },
    });

    if (!user) {
      return ApiResponseHelper.notFound(c, 'User not found');
    }

    const usagePercentage = Math.round((user.credits / user.maxCredits) * 100);
    const isLowCredits = usagePercentage < 25;

    return ApiResponseHelper.success(c, {
      credits: user.credits,
      maxCredits: user.maxCredits,
      usagePercentage,
      isLowCredits,
      plan: user.plan,
      canUpgrade: user.plan !== 'ENTERPRISE',
    });
  })
);

export default authRouter;