import { Prisma, TransactionStatus, TransactionType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";

type WalletTransactionInput = {
  userId: string;
  amount: number | string | Prisma.Decimal;
  type: TransactionType;
  status?: TransactionStatus;
  reference?: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  predictionId?: string;
  matchId?: string;
};

export class WalletNotFoundError extends Error {
  constructor() {
    super("Wallet not found.");
    this.name = "WalletNotFoundError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Insufficient wallet balance.");
    this.name = "InsufficientBalanceError";
  }
}

const creditTypes = new Set<TransactionType>([
  TransactionType.DEPOSIT,
  TransactionType.WINNING,
  TransactionType.REFUND,
  TransactionType.PRIZEPOOL_BOOST,
]);

const debitTypes = new Set<TransactionType>([TransactionType.ENTRY_FEE]);

function toDecimal(amount: WalletTransactionInput["amount"]) {
  return new Prisma.Decimal(amount);
}

function transactionDelta(type: TransactionType, amount: Prisma.Decimal) {
  if (creditTypes.has(type)) {
    return amount;
  }

  if (debitTypes.has(type)) {
    return amount.negated();
  }

  throw new Error(`Unsupported transaction type: ${type}`);
}

function serializeWallet(wallet: {
  id: string;
  userId: string;
  balance: Prisma.Decimal;
  totalDeposits: Prisma.Decimal;
  totalWinnings: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: wallet.id,
    userId: wallet.userId,
    balance: wallet.balance.toNumber(),
    totalDeposits: wallet.totalDeposits.toNumber(),
    totalWinnings: wallet.totalWinnings.toNumber(),
    currency: wallet.currency,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}

function serializeTransaction(transaction: {
  id: string;
  userId: string;
  walletId: string;
  amount: Prisma.Decimal;
  type: TransactionType;
  status: TransactionStatus;
  balanceAfter: Prisma.Decimal | null;
  reference: string | null;
  description: string | null;
  createdAt: Date;
}) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    walletId: transaction.walletId,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    status: transaction.status,
    balanceAfter: transaction.balanceAfter?.toNumber() ?? null,
    reference: transaction.reference,
    description: transaction.description,
    createdAt: transaction.createdAt.toISOString(),
  };
}

export async function getWalletForUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new WalletNotFoundError();
    }

    return serializeWallet(wallet);
  });
}

export async function getWalletTransactions(userId: string, options: { limit: number; cursor?: string }) {
  const transactions = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      throw new WalletNotFoundError();
    }

    return tx.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: options.limit + 1,
      ...(options.cursor
        ? {
            cursor: { id: options.cursor },
            skip: 1,
          }
        : {}),
    });
  });

  const hasMore = transactions.length > options.limit;
  const items = transactions.slice(0, options.limit);

  return {
    transactions: items.map(serializeTransaction),
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

export async function recordWalletTransaction(input: WalletTransactionInput) {
  const amount = toDecimal(input.amount);

  if (amount.lte(0)) {
    throw new Error("Amount must be greater than zero.");
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId: input.userId },
    });

    if (!wallet) {
      throw new WalletNotFoundError();
    }

    const status = input.status ?? TransactionStatus.COMPLETED;
    const delta = status === TransactionStatus.COMPLETED ? transactionDelta(input.type, amount) : new Prisma.Decimal(0);
    const nextBalance = wallet.balance.plus(delta);

    if (nextBalance.lt(0)) {
      throw new InsufficientBalanceError();
    }

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: nextBalance,
        totalDeposits:
          status === TransactionStatus.COMPLETED && input.type === TransactionType.DEPOSIT
            ? { increment: amount }
            : undefined,
        totalWinnings:
          status === TransactionStatus.COMPLETED && input.type === TransactionType.WINNING
            ? { increment: amount }
            : undefined,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: input.userId,
        walletId: wallet.id,
        predictionId: input.predictionId,
        matchId: input.matchId,
        type: input.type,
        status,
        amount,
        balanceAfter: nextBalance,
        reference: input.reference,
        description: input.description,
        metadata: input.metadata,
      },
    });

    return {
      wallet: serializeWallet(updatedWallet),
      transaction: serializeTransaction(transaction),
    };
  });
}
