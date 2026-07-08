import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/server/auth/cookies";
import { verifyPassword } from "@/lib/server/auth/password";
import { jsonError } from "@/lib/server/auth/responses";
import { signAuthToken } from "@/lib/server/auth/tokens";
import { loginSchema, validationErrorMessage } from "@/lib/server/auth/validation";
import { toSafeAuthUser } from "@/lib/server/auth/users";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(validationErrorMessage(parsed.error));
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
      displayName: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return jsonError("Invalid email or password.", 401);
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return jsonError("Invalid email or password.", 401);
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    username: user.username,
  });
  const response = NextResponse.json({
    user: toSafeAuthUser(user),
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

  return response;
}
