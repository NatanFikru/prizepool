import { MatchStatus, PredictionOutcome, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";

type MatchWithRelations = Prisma.MatchGetPayload<{
  include: {
    league: true;
    homeTeam: true;
    awayTeam: true;
    predictions: {
      select: {
        outcome: true;
      };
    };
  };
}>;

function apiStatus(status: MatchStatus) {
  if (status === MatchStatus.LIVE) {
    return "live";
  }

  if (status === MatchStatus.FINISHED || status === MatchStatus.CANCELLED || status === MatchStatus.POSTPONED) {
    return "completed";
  }

  return "upcoming";
}

function outcomeLabel(percent: number) {
  if (percent >= 45) {
    return "Favorite";
  }

  if (percent <= 25) {
    return "Underdog";
  }

  return "Competitive";
}

function outcomePercentages(predictions: MatchWithRelations["predictions"]) {
  const total = predictions.length;

  if (total === 0) {
    return {
      homePercent: 33,
      drawPercent: 34,
      awayPercent: 33,
    };
  }

  const home = predictions.filter((prediction) => prediction.outcome === PredictionOutcome.HOME).length;
  const draw = predictions.filter((prediction) => prediction.outcome === PredictionOutcome.DRAW).length;
  const away = predictions.filter((prediction) => prediction.outcome === PredictionOutcome.AWAY).length;

  return {
    homePercent: Math.round((home / total) * 100),
    drawPercent: Math.round((draw / total) * 100),
    awayPercent: Math.round((away / total) * 100),
  };
}

export function serializeMatch(match: MatchWithRelations) {
  const percentages = outcomePercentages(match.predictions);

  return {
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    league: match.league.name,
    kickoffAt: match.startsAt.toISOString(),
    boostActive: match.prizePoolAmount.gt(0),
    homePercent: percentages.homePercent,
    drawPercent: percentages.drawPercent,
    awayPercent: percentages.awayPercent,
    homeLabel: outcomeLabel(percentages.homePercent),
    drawLabel: outcomeLabel(percentages.drawPercent),
    awayLabel: outcomeLabel(percentages.awayPercent),
    status: apiStatus(match.status),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winningOutcome: match.winningOutcome?.toLowerCase() ?? null,
    entryFee: match.entryFee.toNumber(),
    prizePoolAmount: match.prizePoolAmount.toNumber(),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

export async function listMatches() {
  const matches = await prisma.match.findMany({
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      predictions: {
        select: {
          outcome: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 100,
  });

  return matches.map(serializeMatch);
}

export async function getMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      predictions: {
        select: {
          outcome: true,
        },
      },
    },
  });

  return match ? serializeMatch(match) : null;
}
