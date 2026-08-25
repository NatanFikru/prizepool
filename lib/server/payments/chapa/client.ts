import { getChapaConfig } from "./config";

type ChapaInitializeInput = {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
};

export type ChapaVerification = {
  txRef: string;
  status: string;
  amount: number;
  currency: string;
  reference?: string;
  raw: unknown;
};

type ChapaInitializeResponse = {
  status?: string;
  message?: string;
  data?: {
    checkout_url?: string;
  };
};

type ChapaVerifyResponse = {
  status?: string;
  message?: string;
  data?: {
    tx_ref?: string;
    status?: string;
    amount?: number | string;
    currency?: string;
    reference?: string;
  };
};

export class ChapaApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ChapaApiError";
  }
}

function isSuccessfulApiStatus(status: string | undefined) {
  return status?.toLowerCase() === "success";
}

async function chapaFetch<T>(path: string, init: RequestInit): Promise<T> {
  const config = getChapaConfig();
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !body) {
    throw new ChapaApiError("Chapa API request failed.", response.status);
  }

  return body;
}

export async function initializeChapaTransaction(input: ChapaInitializeInput) {
  const body = await chapaFetch<ChapaInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount.toFixed(2),
      currency: input.currency,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      tx_ref: input.txRef,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      customization: {
        title: "PrizePool Deposit",
        description: "Wallet deposit",
      },
    }),
  });

  if (!isSuccessfulApiStatus(body.status) || !body.data?.checkout_url) {
    throw new ChapaApiError(body.message ?? "Chapa did not return a checkout URL.");
  }

  return {
    checkoutUrl: body.data.checkout_url,
  };
}

export async function verifyChapaTransaction(txRef: string): Promise<ChapaVerification> {
  const body = await chapaFetch<ChapaVerifyResponse>(`/transaction/verify/${encodeURIComponent(txRef)}`, {
    method: "GET",
  });
  const amount = Number(body.data?.amount);

  if (!isSuccessfulApiStatus(body.status) || !body.data?.tx_ref || !body.data.status || !Number.isFinite(amount)) {
    throw new ChapaApiError(body.message ?? "Chapa verification response is incomplete.");
  }

  return {
    txRef: body.data.tx_ref,
    status: body.data.status,
    amount,
    currency: body.data.currency ?? "",
    reference: body.data.reference,
    raw: body,
  };
}
