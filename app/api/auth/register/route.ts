import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/server/auth/cookies";
import { hashPassword } from "@/lib/server/auth/password";
import { jsonError } from "@/lib/server/auth/responses";
import { signAuthToken } from "@/lib/server/auth/tokens";
import { registerSchema, validationErrorMessage } from "@/lib/server/auth/validation";
import { toSafeAuthUser, usernameFromEmail } from "@/lib/server/auth/users";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(validationErrorMessage(parsed.error));
  }

  const email = parsed.data.email;
  const displayName = parsed.data.displayName ?? parsed.data.name;
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const username = parsed.data.username ?? `${usernameFromEmail(email)}_${randomInt(1000, 9999)}`;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      });

      await tx.wallet.create({
        data: {
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
    const response = NextResponse.json({ user: toSafeAuthUser(user) }, { status: 201 });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "";

      if (target.includes("email")) {
        return jsonError("An account with this email already exists.", 409);
      }

      if (target.includes("username")) {
        return jsonError("This username is already taken.", 409);
      }
    }

    console.error("Registration failed", error);
    return jsonError("Unable to create account. Please try again.", 500);
  }
}
