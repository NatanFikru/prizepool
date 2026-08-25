import { z } from "zod";

export const initializeChapaDepositSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Deposit amount must be greater than zero.")
    .max(100_000, "Deposit amount is too large.")
    .refine((amount) => Number.isFinite(amount), "Deposit amount must be valid.")
    .refine((amount) => Number.isInteger(Math.round(amount * 100)), "Deposit amount is invalid."),
});

export function validationErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request.";
}
