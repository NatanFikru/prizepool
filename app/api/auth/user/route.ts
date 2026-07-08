import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth/cookies";
import { jsonError } from "@/lib/server/auth/responses";
import { verifyAuthToken } from "@/lib/server/auth/tokens";
import { toSafeAuthUser } from "@/lib/server/auth/users";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return jsonError("Authentication required.", 401);
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return jsonError("Invalid or expired session.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return jsonError("Invalid or expired session.", 401);
  }

  return NextResponse.json({ user: toSafeAuthUser(user) });
}
