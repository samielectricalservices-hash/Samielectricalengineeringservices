import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().default(false)
});

export type LoginInput = z.infer<typeof loginSchema>;
