import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TX_REF_PREFIX = "ppdep";
const SIGNATURE_HEX_LENGTH = 24;

type DepositReferenceParts = {
  userId: string;
  amountMinor: string;
  currency: string;
  nonce: string;
};

export type ParsedDepositReference = DepositReferenceParts & {
  txRef: string;
};

function signDepositReference(parts: DepositReferenceParts, secret: string) {
  return createHmac("sha256", secret)
    .update([TX_REF_PREFIX, parts.userId, parts.amountMinor, parts.currency, parts.nonce].join(":"))
    .digest("hex")
    .slice(0, SIGNATURE_HEX_LENGTH);
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function amountToMinorUnit(amount: number) {
  return Math.round(amount * 100).toString();
}

export function createDepositTxRef(input: { userId: string; amount: number; currency: string; secret: string }) {
  const parts: DepositReferenceParts = {
    userId: input.userId,
    amountMinor: amountToMinorUnit(input.amount),
    currency: input.currency.toUpperCase(),
    nonce: randomBytes(8).toString("hex"),
  };
  const signature = signDepositReference(parts, input.secret);

  return [TX_REF_PREFIX, parts.userId, parts.amountMinor, parts.currency, parts.nonce, signature].join("_");
}

export function parseDepositTxRef(txRef: string, secret: string): ParsedDepositReference | null {
  const [prefix, userId, amountMinor, currency, nonce, signature, ...extra] = txRef.split("_");

  if (
    extra.length > 0 ||
    prefix !== TX_REF_PREFIX ||
    !userId ||
    !/^\d+$/.test(amountMinor ?? "") ||
    !/^[A-Z]{3}$/.test(currency ?? "") ||
    !/^[a-f0-9]{16}$/.test(nonce ?? "") ||
    !/^[a-f0-9]{24}$/.test(signature ?? "")
  ) {
    return null;
  }

  const parts = { userId, amountMinor, currency, nonce };
  const expectedSignature = signDepositReference(parts, secret);

  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return null;
  }

  return {
    ...parts,
    txRef,
  };
}
