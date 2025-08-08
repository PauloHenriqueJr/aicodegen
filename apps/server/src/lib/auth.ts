import { createHash, randomBytes } from 'crypto';
import prisma from '../../prisma';
import type { SessionUser } from '../types';

export class AuthService {
  /**
   * Hash password with salt
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || randomBytes(32).toString('hex');
    const hash = createHash('sha256')
      .update(password + actualSalt)
      .digest('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: testHash } = AuthService.hashPassword(password, salt);
    return testHash === hash;
  }

  /**
   * Generate session token
   */
  static generateSessionToken(): string {
    return randomBytes(64).toString('hex');
  }

  /**
   * Create session for user
   */
  static async createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = AuthService.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  /**
   * Get user from session token
   */
  static async getUserFromSession(token: string): Promise<SessionUser | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      plan: session.user.plan,
    };
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  static async createUser(email: string, name: string, password: string) {
    const { hash, salt } = AuthService.hashPassword(password);
    
    return await prisma.user.create({
      data: {
        email,
        name,
        // For now, we'll store password hash in a separate table or handle differently
        // This is a simplified version
      },
    });
  }

  /**
   * Check if user has sufficient credits
   */
  static async checkCredits(userId: string, requiredCredits: number = 1): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user ? user.credits >= requiredCredits : false;
  }

  /**
   * Deduct credits from user
   */
  static async deductCredits(userId: string, amount: number = 1): Promise<boolean> {
    try {
      await prisma.user.update({
        where: {
          id: userId,
          credits: {
            gte: amount,
          },
        },
        data: {
          credits: {
            decrement: amount,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add credits to user (for upgrades, admin, etc.)
   */
  static async addCredits(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  }
}

// Clean up expired sessions periodically
setInterval(() => {
  AuthService.cleanupExpiredSessions().catch(console.error);
}, 1000 * 60 * 60); // Every hour