import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { AuditService } from "@/services/audit-service";
import { UserService } from "@/services/user-service";

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

type RequestMetadata = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
  lockedUntil: Date | null;
};

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" | "ACCOUNT_INACTIVE"
  ) {
    super(message);
  }
}

export class AuthenticationService {
  static async authenticateCredentials(
    email: string,
    password: string,
    metadata: RequestMetadata
  ): Promise<AuthenticatedUser> {
    const normalizedEmail = email.toLowerCase();
    const user = await UserService.findByEmail(normalizedEmail);

    if (!user) {
      await this.recordFailedAttempt({
        email: normalizedEmail,
        userId: null,
        reason: "Unknown email.",
        metadata
      });
      throw new AuthenticationError(
        "The email or password is incorrect.",
        "INVALID_CREDENTIALS"
      );
    }

    await UserService.unlockIfExpired(user.id, user.lockedUntil);

    const refreshedUser =
      user.lockedUntil && user.lockedUntil <= new Date()
        ? await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
        : user;

    if (refreshedUser.lockedUntil && refreshedUser.lockedUntil > new Date()) {
      throw new AuthenticationError(
        "This account is temporarily locked. Try again in 15 minutes or contact the company owner.",
        "ACCOUNT_LOCKED"
      );
    }

    if (refreshedUser.status === "INACTIVE") {
      throw new AuthenticationError(
        "This account is inactive. Contact the company owner for access.",
        "ACCOUNT_INACTIVE"
      );
    }

    const passwordMatches = await argon2.verify(refreshedUser.passwordHash, password);

    if (!passwordMatches) {
      const lockedUntil = await this.recordFailedAttempt({
        email: normalizedEmail,
        userId: refreshedUser.id,
        reason: "Invalid password.",
        metadata
      });

      if (lockedUntil) {
        throw new AuthenticationError(
          "Too many failed attempts. Your account is locked for 15 minutes.",
          "ACCOUNT_LOCKED"
        );
      }

      throw new AuthenticationError(
        "The email or password is incorrect.",
        "INVALID_CREDENTIALS"
      );
    }

    await prisma.$transaction([
      prisma.loginAttempt.create({
        data: {
          userId: refreshedUser.id,
          email: normalizedEmail,
          successful: true,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent
        }
      }),
      prisma.user.update({
        where: { id: refreshedUser.id },
        data: {
          status: "ACTIVE",
          lockedUntil: null,
          lastLoginAt: new Date()
        }
      })
    ]);

    await AuditService.record({
      actorId: refreshedUser.id,
      action: "LOGIN",
      entityType: "User",
      entityId: refreshedUser.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    logger.info("User authenticated.", { userId: refreshedUser.id });

    return refreshedUser;
  }

  static async getLockMessage(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { lockedUntil: true }
    });

    if (!user?.lockedUntil || user.lockedUntil <= new Date()) {
      return null;
    }

    return "Too many failed attempts. Your account is locked for 15 minutes.";
  }

  private static async recordFailedAttempt(input: {
    email: string;
    userId: string | null;
    reason: string;
    metadata: RequestMetadata;
  }) {
    const since = new Date(Date.now() - LOCK_MINUTES * 60 * 1000);

    await prisma.loginAttempt.create({
      data: {
        userId: input.userId,
        email: input.email,
        successful: false,
        failureReason: input.reason,
        ipAddress: input.metadata.ipAddress,
        userAgent: input.metadata.userAgent
      }
    });

    if (!input.userId) {
      await AuditService.record({
        action: "LOGIN_FAILED",
        entityType: "User",
        ipAddress: input.metadata.ipAddress,
        userAgent: input.metadata.userAgent,
        metadata: { email: input.email, reason: input.reason }
      });
      return null;
    }

    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        userId: input.userId,
        successful: false,
        createdAt: { gte: since }
      }
    });

    await AuditService.record({
      actorId: input.userId,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: input.userId,
      ipAddress: input.metadata.ipAddress,
      userAgent: input.metadata.userAgent,
      metadata: { reason: input.reason, failedAttempts }
    });

    if (failedAttempts < MAX_FAILED_ATTEMPTS) {
      return null;
    }

    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: input.userId },
      data: {
        status: "LOCKED",
        lockedUntil
      }
    });

    await AuditService.record({
      actorId: input.userId,
      action: "LOCKOUT",
      entityType: "User",
      entityId: input.userId,
      ipAddress: input.metadata.ipAddress,
      userAgent: input.metadata.userAgent,
      metadata: { lockedUntil: lockedUntil.toISOString() }
    });

    return lockedUntil;
  }
}
