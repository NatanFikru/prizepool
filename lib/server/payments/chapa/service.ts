import { timingSafeEqual } from "node:crypto";
import { Prisma, TransactionStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { recordVerifiedDeposit, WalletNotFoundError } from "@/lib/server/wallet/service";
import { getChapaConfig } from "./config";
import { initializeChapaTransaction, verifyChapaTransaction } from "./client";
import { amountToMinorUnit, createDepositTxRef, parseDepositTxRef } from "./references";

type AuthenticatedDepositUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
};

export class ChapaPaymentError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "ChapaPaymentError";
  }
}

function splitDisplayName(user: AuthenticatedDepositUser) {
  const parts = (user.displayName || user.username || user.email.split("@")[0] || "PrizePool User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] ?? "PrizePool",
    lastName: parts.slice(1).join(" ") || "User",
  };
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isVerifiedPaidStatus(status: string) {
  return status.toLowerCase() === "success";
}

export function verifyChapaWebhookSignature(headers: Headers) {
  const config = getChapaConfig();
  const signature =
    headers.get("Chapa-Signature") ?? headers.get("chapa-signature") ?? headers.get("x-chapa-signature");

  if (!signature) {
    return false;
  }

  return timingSafeStringEqual(signature, config.webhookSecret);
}

export async function initializeChapaDeposit(user: AuthenticatedDepositUser, amount: number) {
  const config = getChapaConfig();
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!wallet) {
    throw new WalletNotFoundError();
  }

  const txRef = createDepositTxRef({
    userId: user.id,
    amount,
    currency: config.currency,
    secret: config.txRefSecret,
  });
  const { firstName, lastName } = splitDisplayName(user);
  const checkout = await initializeChapaTransaction({
    amount,
    currency: config.currency,
    email: user.email,
    firstName,
    lastName,
    txRef,
    callbackUrl: `${config.appBaseUrl}/api/payments/chapa/webhook`,
    returnUrl: `${config.appBaseUrl}/wallet`,
  });

  return {
    txRef,
    checkoutUrl: checkout.checkoutUrl,
  };
}

function readWebhookTxRef(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const nestedData = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;
  const txRef = payload.tx_ref ?? payload.txRef ?? nestedData?.tx_ref ?? nestedData?.txRef;

  return typeof txRef === "string" && txRef.trim() ? txRef.trim() : null;
}

export async function processChapaDepositWebhook(body: unknown) {
  const config = getChapaConfig();
  const txRef = readWebhookTxRef(body);

  if (!txRef) {
    throw new ChapaPaymentError("Webhook payload is missing tx_ref.");
  }

  const parsedReference = parseDepositTxRef(txRef, config.txRefSecret);

  if (!parsedReference) {
    throw new ChapaPaymentError("Invalid deposit reference.", 400);
  }

  const verification = await verifyChapaTransaction(txRef);

  if (verification.txRef !== txRef) {
    throw new ChapaPaymentError("Verified transaction reference mismatch.", 400);
  }

  if (!isVerifiedPaidStatus(verification.status)) {
    console.warn("Ignoring unpaid Chapa deposit webhook", {
      txRef,
      status: verification.status,
    });

    return {
      credited: false,
      duplicate: false,
      status: verification.status,
    };
  }

  const verifiedAmountMinor = amountToMinorUnit(verification.amount);

  if (verifiedAmountMinor !== parsedReference.amountMinor) {
    throw new ChapaPaymentError("Verified transaction amount mismatch.", 400);
  }

  if (verification.currency.toUpperCase() !== parsedReference.currency || parsedReference.currency !== config.currency) {
    throw new ChapaPaymentError("Verified transaction currency mismatch.", 400);
  }

  const deposit = await recordVerifiedDeposit({
    userId: parsedReference.userId,
    amount: new Prisma.Decimal(verification.amount),
    reference: txRef,
    description: "Chapa wallet deposit",
    metadata: {
      provider: "chapa",
      providerReference: verification.reference,
      verification: verification.raw as Prisma.InputJsonValue,
    },
  });

  return {
    credited: deposit.transaction.status === TransactionStatus.COMPLETED,
    duplicate: deposit.duplicate,
    status: verification.status,
  };
}
