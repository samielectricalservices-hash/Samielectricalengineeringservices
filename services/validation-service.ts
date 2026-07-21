import { ZodError, type ZodSchema } from "zod";

export class ValidationService {
  static parse<T>(schema: ZodSchema<T>, input: unknown): T {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(error.errors[0]?.message ?? "Invalid input.");
      }

      throw error;
    }
  }
}
