import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Password login is available via POST /api/auth/login.",
    },
    { status: 405 },
  );
}
