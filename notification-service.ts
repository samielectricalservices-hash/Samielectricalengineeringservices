import { prisma } from "@/lib/prisma";

export class NotificationService {
  static async create(userId: string, title: string, message: string) {
    return prisma.notification.create({
      data: { userId, title, message }
    });
  }

  static async recent(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8
    });
  }

  static async unreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        status: "UNREAD"
      }
    });
  }

  static async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        status: "UNREAD"
      },
      data: {
        status: "READ",
        readAt: new Date()
      }
    });
  }
}