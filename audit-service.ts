import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type AuditInput = {
  actorId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGIN_FAILED" | "LOGOUT" | "LOCKOUT";
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export class AuditService {
  static async record(input: AuditInput) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: input.actorId ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          metadata: input.metadata as never
        }
      });
    } catch (error) {
      logger.error("Failed to write audit log.", { error, action: input.action });
    }
  }
}
