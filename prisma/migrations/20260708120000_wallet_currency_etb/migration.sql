-- Change the default wallet currency for new wallets.
ALTER TABLE "Wallet" ALTER COLUMN "currency" SET DEFAULT 'ETB';

-- Convert existing Ethiopian PrizePool wallets from the old USD default to ETB.
UPDATE "Wallet"
SET "currency" = 'ETB'
WHERE "currency" = 'USD';
