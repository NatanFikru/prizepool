import { z } from "zod";

export const joinPredictionContestSchema = z.object({
  matchId: z.string().trim().min(1, "Match is required."),
  outcome: z.enum(["home", "draw", "away"]),
  stakeAmount: z.coerce
    .number()
    .positive("Stake amount must be greater than zero.")
    .refine((amount) => [40, 100, 400].includes(amount), "Stake amount is not allowed."),
});

export function validationErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request.";
}
