import { Hono } from 'hono';
import { AuthService } from '../lib/auth';
import { ApiResponseHelper, asyncHandler } from '../lib/response';
import { validateBody } from '../middleware/validation';
import { authMiddleware, rateLimit } from '../middleware/auth';
import { LoginSchema, RegisterSchema } from '../types';
import prisma from '../../prisma';

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