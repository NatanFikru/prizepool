import { z } from "zod";
import { TransactionStatus, TransactionType } from "@/lib/generated/prisma/client";

export const walletTransactionSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.COMPLETED),
  reference: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
  predictionId: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
});

export const transactionHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
});
