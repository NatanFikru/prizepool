import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { WalletNotFoundError } from "@/lib/server/wallet/service";
import { ChapaApiError } from "@/lib/server/payments/chapa/client";
import {
  ChapaPaymentError,
  processChapaDepositWebhook,
  verifyChapaWebhookSignature,
} from "@/lib/server/payments/chapa/service";

export async function POST(request: NextRequest) {
  if (!verifyChapaWebhookSignature(request.headers)) {
    console.warn("Rejected Chapa webhook with invalid signature");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const result = await processChapaDepositWebhook(body);

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof ChapaPaymentError) {
      console.warn("Rejected Chapa webhook", {
        status: error.status,
        message: error.message,
      });

      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof WalletNotFoundError) {
      console.error("Verified Chapa deposit could not find wallet", error);
      return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
    }

    if (error instanceof ChapaApiError) {
      console.error("Chapa verification failed during webhook processing", {
        status: error.status,
        message: error.message,
      });

      return NextResponse.json({ error: "Unable to verify Chapa transaction." }, { status: 502 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Database error while processing Chapa webhook", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json({ error: "Unable to process Chapa webhook." }, { status: 500 });
    }

    console.error("Unexpected Chapa webhook processing error", error);
    return NextResponse.json({ error: "Unable to process Chapa webhook." }, { status: 500 });
  }
}
