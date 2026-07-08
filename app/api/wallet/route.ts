import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth/session";
import { jsonError } from "@/lib/server/auth/responses";
import { getWalletForUser, WalletNotFoundError } from "@/lib/server/wallet/service";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const wallet = await getWalletForUser(user.id);

    return NextResponse.json({ wallet });
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return jsonError("Wallet not found for this user.", 404);
    }

    console.error("Failed to load wallet", error);
    return jsonError("Unable to load wallet.", 500);
  }
}
