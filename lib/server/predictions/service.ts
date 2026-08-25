import {
  MatchStatus,
  PredictionOutcome,
  PredictionStatus,
  Prisma,
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";

const PREDICTION_CLOSE_MINUTES = 10;

type JoinPredictionInput = {
  userId: string;
  matchId: string;
  outcome: "home" | "draw" | "away";
  stakeAmount: number;
};

type SerializedPredictionInput = {
  id: string;
  userId: string;
  matchId: string;
  outcome: PredictionOutcome;
  stakeAmount: Prisma.Decimal;
  potentialPayout: Prisma.Decimal | null;
  status: PredictionStatus;
  createdAt: Date;
};

export class PredictionError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "PredictionError";
  }
}

function toPredictionOutcome(outcome: JoinPredictionInput["outcome"]) {
  if (outcome === "home") {
    return PredictionOutcome.HOME;
  }

  if (outcome === "away") {
    return PredictionOutcome.AWAY;
  }

  return PredictionOutcome.DRAW;
}

function serializePrediction(prediction: SerializedPredictionInput) {
  return {
    id: prediction.id,
    userId: prediction.userId,
    matchId: prediction.matchId,
    outcome: prediction.outcome.toLowerCase() as "home" | "draw" | "away",
    stakeAmount: prediction.stakeAmount.toNumber(),
    status:
      prediction.status === PredictionStatus.WON
        ? "won"
        : prediction.status === PredictionStatus.LOST
          ? "lost"
          : "pending",
    rewardAmount: prediction.potentialPayout?.toNumber() ?? null,
    createdAt: prediction.createdAt.toISOString(),
  };
}

function predictionDeadline(startsAt: Date) {
  return new Date(startsAt.getTime() - PREDICTION_CLOSE_MINUTES * 60_000);
}

function assertMatchCanAcceptPredictions(match: { startsAt: Date; status: MatchStatus }) {
  if (match.status !== MatchStatus.SCHEDULED) {
    throw new PredictionError("Predictions are closed for this match.", 409);
  }

  if (Date.now() >= predictionDeadline(match.startsAt).getTime()) {
    throw new PredictionError("Prediction deadline has passed for this match.", 409);
  }
}

function resolveEntryFee(matchEntryFee: Prisma.Decimal, requestedStake: number) {
  const requested = new Prisma.Decimal(requestedStake);

  if (matchEntryFee.gt(0) && !matchEntryFee.equals(requested)) {
    throw new PredictionError(`This contest entry fee is ${matchEntryFee.toNumber()} ETB.`, 400);
  }

  return matchEntryFee.gt(0) ? matchEntryFee : requested;
}

export async function listPredictionsForUser(userId: string) {
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return predictions.map(serializePrediction);
}

export async function joinPredictionContest(input: JoinPredictionInput) {
  const outcome = toPredictionOutcome(input.outcome);

  try {
    const prediction = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: input.matchId },
        select: {
          id: true,
          startsAt: true,
          status: true,
          entryFee: true,
        },
      });

      if (!match) {
        throw new PredictionError("Match not found.", 404);
      }

      assertMatchCanAcceptPredictions(match);

      const existingPrediction = await tx.prediction.findUnique({
        where: {
          userId_matchId: {
            userId: input.userId,
            matchId: input.matchId,
          },
        },
        select: { id: true },
      });

      if (existingPrediction) {
        throw new PredictionError("You have already joined this prediction contest.", 409);
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new PredictionError("Wallet not found for this user.", 404);
      }

      const entryFee = resolveEntryFee(match.entryFee, input.stakeAmount);

      const createdPrediction = await tx.prediction.create({
        data: {
          userId: input.userId,
          matchId: input.matchId,
          outcome,
          stakeAmount: entryFee,
          status: PredictionStatus.PENDING,
        },
      });

      const debitedWallet = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          balance: {
            gte: entryFee,
          },
        },
        data: {
          balance: {
            decrement: entryFee,
          },
        },
      });

      if (debitedWallet.count !== 1) {
        throw new PredictionError("Insufficient wallet balance.", 402);
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
        select: { balance: true },
      });

      if (!updatedWallet) {
        throw new PredictionError("Wallet not found for this user.", 404);
      }

      await tx.match.update({
        where: { id: input.matchId },
        data: {
          prizePoolAmount: {
            increment: entryFee,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: input.userId,
          walletId: wallet.id,
          predictionId: createdPrediction.id,
          matchId: input.matchId,
          type: TransactionType.ENTRY_FEE,
          status: TransactionStatus.COMPLETED,
          amount: entryFee,
          balanceAfter: updatedWallet.balance,
          reference: `entry:${createdPrediction.id}`,
          description: "Prediction contest entry fee",
          metadata: {
            outcome,
            predictionDeadline: predictionDeadline(match.startsAt).toISOString(),
          },
        },
      });

      return createdPrediction;
    });

    return serializePrediction(prediction);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new PredictionError("You have already joined this prediction contest.", 409);
    }

    throw error;
  }
}

function winningOutcomeForScore(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) {
    return PredictionOutcome.HOME;
  }

  if (awayScore > homeScore) {
    return PredictionOutcome.AWAY;
  }

  return PredictionOutcome.DRAW;
}

export async function settleFinishedMatch(matchId: string) {
  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      include: {
        predictions: true,
      },
    });

    if (!match) {
      throw new PredictionError("Match not found.", 404);
    }

    if (match.status !== MatchStatus.FINISHED || match.homeScore === null || match.awayScore === null) {
      throw new PredictionError("Match is not ready for settlement.", 409);
    }

    if (match.predictions.every((prediction) => prediction.status !== PredictionStatus.PENDING)) {
      return {
        settled: false,
        winners: 0,
        prizePoolAmount: match.prizePoolAmount.toNumber(),
      };
    }

    const winningOutcome = winningOutcomeForScore(match.homeScore, match.awayScore);
    const pendingPredictions = match.predictions.filter((prediction) => prediction.status === PredictionStatus.PENDING);
    const winningPredictions = pendingPredictions.filter((prediction) => prediction.outcome === winningOutcome);
    const payout =
      winningPredictions.length > 0
        ? match.prizePoolAmount.div(winningPredictions.length).toDecimalPlaces(2)
        : new Prisma.Decimal(0);

    await tx.match.update({
      where: { id: match.id },
      data: { winningOutcome },
    });

    for (const prediction of pendingPredictions) {
      const didWin = prediction.outcome === winningOutcome;

      await tx.prediction.update({
        where: { id: prediction.id },
        data: {
          status: didWin ? PredictionStatus.WON : PredictionStatus.LOST,
          potentialPayout: didWin ? payout : null,
        },
      });

      if (didWin && payout.gt(0)) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: prediction.userId },
        });

        if (!wallet) {
          throw new PredictionError("Wallet not found for settlement winner.", 500);
        }

        const nextBalance = wallet.balance.plus(payout);

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: nextBalance,
            totalWinnings: {
              increment: payout,
            },
          },
        });

        await tx.transaction.create({
          data: {
            userId: prediction.userId,
            walletId: wallet.id,
            predictionId: prediction.id,
            matchId: match.id,
            type: TransactionType.WINNING,
            status: TransactionStatus.COMPLETED,
            amount: payout,
            balanceAfter: nextBalance,
            reference: `settlement:${match.id}:${prediction.id}`,
            description: "Prediction contest winning",
            metadata: {
              winningOutcome,
            },
          },
        });
      }
    }

    return {
      settled: true,
      winners: winningPredictions.length,
      prizePoolAmount: match.prizePoolAmount.toNumber(),
      payout: payout.toNumber(),
      winningOutcome: winningOutcome.toLowerCase(),
    };
  });
}

export async function settleReadyMatches() {
  const readyMatches = await prisma.match.findMany({
    where: {
      status: MatchStatus.FINISHED,
      homeScore: { not: null },
      awayScore: { not: null },
      predictions: {
        some: {
          status: PredictionStatus.PENDING,
        },
      },
    },
    select: {
      id: true,
    },
  });
  const results = [];

  for (const match of readyMatches) {
    results.push(await settleFinishedMatch(match.id));
  }

  return {
    matchesChecked: readyMatches.length,
    results,
  };
}
