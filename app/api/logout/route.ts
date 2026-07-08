import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearAuthCookieOptions } from "@/lib/server/auth/cookies";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set(AUTH_COOKIE_NAME, "", clearAuthCookieOptions());

  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE_NAME, "", clearAuthCookieOptions());

  return response;
}
