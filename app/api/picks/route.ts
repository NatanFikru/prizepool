import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { jsonError } from "@/lib/server/auth/responses";
import { getAuthenticatedUser } from "@/lib/server/auth/session";
import { joinPredictionContest, listPredictionsForUser, PredictionError } from "@/lib/server/predictions/service";
import { joinPredictionContestSchema, validationErrorMessage } from "@/lib/server/predictions/validation";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const picks = await listPredictionsForUser(user.id);

    return NextResponse.json({ picks });
  } catch (error) {
    console.error("Failed to list user predictions", error);
    return jsonError("Unable to load predictions.", 500);
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const parsed = joinPredictionContestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(validationErrorMessage(parsed.error));
  }

  try {
    const pick = await joinPredictionContest({
      userId: user.id,
      matchId: parsed.data.matchId,
      outcome: parsed.data.outcome,
      stakeAmount: parsed.data.stakeAmount,
    });

    return NextResponse.json({ pick }, { status: 201 });
  } catch (error) {
    if (error instanceof PredictionError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("You have already joined this prediction contest.", 409);
    }

    console.error("Failed to join prediction contest", error);
    return jsonError("Unable to submit prediction.", 500);
  }
}
