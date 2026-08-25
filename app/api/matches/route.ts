import { NextResponse } from "next/server";
import { listMatches } from "@/lib/server/matches/service";

export async function GET() {
  try {
    const matches = await listMatches();

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Failed to list matches", error);
    return NextResponse.json({ error: "Unable to load matches." }, { status: 500 });
  }
}
