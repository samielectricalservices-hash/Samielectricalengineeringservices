import { prisma } from "@/lib/prisma";

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  static async unlockIfExpired(userId: string, lockedUntil: Date | null) {
    if (!lockedUntil || lockedUntil > new Date()) {
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        lockedUntil: null
      }
    });
  }
}
