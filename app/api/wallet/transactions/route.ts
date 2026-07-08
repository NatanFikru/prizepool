import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth/session";
import { jsonError } from "@/lib/server/auth/responses";
import { getWalletTransactions, WalletNotFoundError } from "@/lib/server/wallet/service";
import { transactionHistoryQuerySchema } from "@/lib/server/wallet/validation";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const parsed = transactionHistoryQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    cursor: request.nextUrl.searchParams.get("cursor") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query parameters.");
  }

  try {
    const result = await getWalletTransactions(user.id, parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return jsonError("Wallet not found for this user.", 404);
    }

    console.error("Failed to load wallet transactions", error);
    return jsonError("Unable to load wallet transactions.", 500);
  }
}
