"use server";

import { redirect } from "next/navigation";
import { getRequestMetadata } from "@/lib/security";
import { createUserSession, destroyCurrentSession } from "@/lib/session";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import { AuthenticationError, AuthenticationService } from "@/services/authentication-service";
import { ValidationService } from "@/services/validation-service";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(input: unknown): Promise<LoginActionState> {
  const parsed = ValidationService.parse(loginSchema, input);
  const metadata = await getRequestMetadata();

  try {
    const user = await AuthenticationService.authenticateCredentials(
      parsed.email,
      parsed.password,
      metadata
    );
    await createUserSession(user.id, parsed.remember === true);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: error.message };
    }

    throw error;
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
