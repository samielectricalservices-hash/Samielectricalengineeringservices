import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OWNER_EMAIL = "Samielectricalengineeringservices@gmail.com";
const OWNER_PASSWORD = "msmssmsmsami";
const PLACEHOLDER_EMAILS = [
  "owner@example.com",
  "admin@example.com",
  "test@example.com",
  "demo@example.com"
];

const ownerPermissions = [
  "users.manage",
  "roles.manage",
  "customers.manage",
  "motors.manage",
  "repairs.manage",
  "reports.manage",
  "documents.manage",
  "audit_logs.read"
];

async function main() {
  async function deleteUsersByEmails(emails: string[]) {
    const users = await prisma.user.findMany({
      where: {
        OR: emails.map((email) => ({
          email: {
            equals: email,
            mode: "insensitive"
          }
        }))
      },
      select: {
        id: true
      }
    });

    if (users.length === 0) {
      return;
    }

    await prisma.user.deleteMany({
      where: {
        id: {
          in: users.map((user) => user.id)
        }
      }
    });
  }

  const permissions = await Promise.all(
    ownerPermissions.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: {
          key,
          description: key.replace(".", " ")
        }
      })
    )
  );

  const ownerRole = await prisma.role.upsert({
    where: { name: "Owner" },
    update: { description: "Company owner with full system access." },
    create: { name: "Owner", description: "Company owner with full system access." }
  });

  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  await deleteUsersByEmails(PLACEHOLDER_EMAILS);

  const ownerMatches = await prisma.user.findMany({
    where: {
      email: {
        equals: OWNER_EMAIL,
        mode: "insensitive"
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const passwordHash = await argon2.hash(OWNER_PASSWORD, {
    type: argon2.argon2id
  });

  const owner =
    ownerMatches.length > 0
      ? await (async () => {
          const canonicalOwner =
            ownerMatches.find((user) => user.email === OWNER_EMAIL) ?? ownerMatches[0];

          if (ownerMatches.length > 1) {
            await prisma.user.deleteMany({
              where: {
                id: {
                  in: ownerMatches
                    .filter((user) => user.id !== canonicalOwner.id)
                    .map((user) => user.id)
                }
              }
            });
          }

          return prisma.user.update({
            where: { id: canonicalOwner.id },
            data: {
              email: OWNER_EMAIL,
              name: "Owner",
              passwordHash,
              status: "ACTIVE",
              lockedUntil: null
            }
          });
        })()
      : prisma.user.create({
          data: {
            email: OWNER_EMAIL,
            name: "Owner",
            passwordHash,
            status: "ACTIVE"
          }
        });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: owner.id,
        roleId: ownerRole.id
      }
    },
    update: {},
    create: {
      userId: owner.id,
      roleId: ownerRole.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: owner.id,
      action: "CREATE",
      entityType: "User",
      entityId: owner.id,
      metadata: { seed: true, email: owner.email }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
