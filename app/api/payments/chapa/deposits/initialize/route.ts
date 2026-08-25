import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/server/auth/responses";
import { getAuthenticatedUser } from "@/lib/server/auth/session";
import { WalletNotFoundError } from "@/lib/server/wallet/service";
import { ChapaApiError } from "@/lib/server/payments/chapa/client";
import { initializeChapaDepositSchema, validationErrorMessage } from "@/lib/server/payments/chapa/validation";
import { ChapaPaymentError, initializeChapaDeposit } from "@/lib/server/payments/chapa/service";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const parsed = initializeChapaDepositSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(validationErrorMessage(parsed.error));
  }

  try {
    const deposit = await initializeChapaDeposit(user, parsed.data.amount);

    return NextResponse.json(deposit);
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return jsonError("Wallet not found for this user.", 404);
    }

    if (error instanceof ChapaPaymentError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof ChapaApiError) {
      console.error("Chapa deposit initialization failed", {
        status: error.status,
        message: error.message,
      });

      return jsonError("Unable to initialize Chapa checkout.", 502);
    }

    console.error("Unexpected Chapa deposit initialization error", error);
    return jsonError("Unable to initialize deposit.", 500);
  }
}
