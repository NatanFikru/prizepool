import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

export const registerSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(32, "Username must be 32 characters or fewer.")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
      .optional(),
    displayName: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(100).optional(),
  })
  .refine((value) => !value.confirmPassword || value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  password: passwordSchema,
});

export function validationErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request body.";
}
