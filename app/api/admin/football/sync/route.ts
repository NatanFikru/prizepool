import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { jsonError } from "@/lib/server/auth/responses";
import { getAuthenticatedUser } from "@/lib/server/auth/session";
import { prisma } from "@/lib/server/prisma";
import { FootballApiError } from "@/lib/server/football/client";
import { SUPPORTED_COMPETITIONS } from "@/lib/server/football/competitions";
import { importUpcomingFixtures } from "@/lib/server/football/service";

const supportedCompetitionKeys = SUPPORTED_COMPETITIONS.map((competition) => competition.key) as [
  (typeof SUPPORTED_COMPETITIONS)[number]["key"],
  ...(typeof SUPPORTED_COMPETITIONS)[number]["key"][],
];

const syncRequestSchema = z.object({
  season: z.coerce.number().int().min(2000).max(2100).default(new Date().getUTCFullYear()),
  daysAhead: z.coerce.number().int().min(1).max(60).default(14),
  maxMatches: z.coerce.number().int().min(1).max(50).default(12),
  competitionKeys: z.array(z.enum(supportedCompetitionKeys)).min(1).max(9).optional(),
});

async function requireActiveAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  return admin?.isActive ? { user, admin } : null;
}

function footballErrorStatus(error: FootballApiError) {
  if (error.code === "INVALID_API_KEY") {
    return 401;
  }

  if (error.code === "RATE_LIMITED") {
    return 429;
  }

  if (error.code === "API_UNAVAILABLE") {
    return 503;
  }

  if (error.code === "INVALID_RESPONSE") {
    return 502;
  }

  return 502;
}

export async function POST(request: NextRequest) {
  const adminSession = await requireActiveAdmin(request);

  if (!adminSession) {
    return jsonError("Admin access required.", 403);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const parsed = syncRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid sync request.");
  }

  console.info("Admin football sync requested", {
    adminUserId: adminSession.user.id,
    season: parsed.data.season,
    daysAhead: parsed.data.daysAhead,
    maxMatches: parsed.data.maxMatches,
    competitionKeys: parsed.data.competitionKeys,
  });

  try {
    const result = await importUpcomingFixtures(parsed.data);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof FootballApiError) {
      console.error("Admin football sync failed", {
        code: error.code,
        status: error.status,
        message: error.message,
      });

      return jsonError(error.message, footballErrorStatus(error));
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Admin football sync database error", {
        code: error.code,
        message: error.message,
      });

      return jsonError("Unable to synchronize football data.", 500);
    }

    console.error("Unexpected admin football sync failure", error);
    return jsonError("Unable to synchronize football data.", 500);
  }
}
