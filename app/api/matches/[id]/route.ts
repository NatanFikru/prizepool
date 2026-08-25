import { NextRequest, NextResponse } from "next/server";
import { getMatch } from "@/lib/server/matches/service";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const match = await getMatch(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found." }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Failed to load match", error);
    return NextResponse.json({ error: "Unable to load match." }, { status: 500 });
  }
}
