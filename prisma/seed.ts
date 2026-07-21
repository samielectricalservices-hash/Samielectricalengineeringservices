import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  const passwordHash = await argon2.hash("msmssmsmsami", {
    type: argon2.argon2id
  });

  const owner = await prisma.user.upsert({
    where: { email: "Samielectricalengineeringservices@gmail.com" },
    update: {
      name: "Owner",
      status: "ACTIVE",
      passwordHash
    },
    create: {
      email: "Samielectricalengineeringservices@gmail.com",
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
