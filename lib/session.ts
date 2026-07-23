import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "msms.session";
const DEFAULT_SESSION_DAYS = 1;
const REMEMBER_SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function createUserSession(userId: string, remember: boolean) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(
    Date.now() + (remember ? REMEMBER_SESSION_DAYS : DEFAULT_SESSION_DAYS) * 24 * 60 * 60 * 1000
  );

  await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  });

  await prisma.session.create({
    data: {
      userId,
      sessionToken: hashToken(token),
      expires
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: hashToken(token) }
    });
  }

  await clearSessionCookie();
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken: hashToken(token) },
    select: {
      id: true,
      expires: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          status: true
        }
      }
    }
  });

  if (!session || session.expires <= new Date() || session.user.status !== "ACTIVE") {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    await clearSessionCookie();
    return null;
  }

  return {
    id: session.id,
    expires: session.expires,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    }
  };
}

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be logged in.");
  }

  return session.user;
}
