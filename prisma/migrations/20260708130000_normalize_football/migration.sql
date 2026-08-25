-- Development reset for the old denormalized football data.
-- There is no production football data to preserve for this schema change.
DELETE FROM "Prediction";
UPDATE "Transaction" SET "matchId" = NULL WHERE "matchId" IS NOT NULL;
DELETE FROM "Match";

CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "venueName" TEXT,
    "venueCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Match" DROP CONSTRAINT IF EXISTS "Match_externalId_key";
DROP INDEX IF EXISTS "Match_homeTeam_awayTeam_idx";

ALTER TABLE "Match"
    DROP COLUMN "externalId",
    DROP COLUMN "homeTeam",
    DROP COLUMN "awayTeam",
    ADD COLUMN "apiFixtureId" INTEGER,
    ADD COLUMN "leagueId" TEXT NOT NULL,
    ADD COLUMN "seasonId" TEXT NOT NULL,
    ADD COLUMN "homeTeamId" TEXT NOT NULL,
    ADD COLUMN "awayTeamId" TEXT NOT NULL,
    ADD COLUMN "venueName" TEXT,
    ADD COLUMN "venueCity" TEXT,
    ADD COLUMN "apiStatusShort" TEXT,
    ADD COLUMN "apiStatusLong" TEXT,
    ADD COLUMN "lastUpdated" TIMESTAMP(3);

CREATE UNIQUE INDEX "League_apiId_key" ON "League"("apiId");
CREATE INDEX "League_name_idx" ON "League"("name");
CREATE INDEX "League_country_idx" ON "League"("country");

CREATE UNIQUE INDEX "Season_leagueId_year_key" ON "Season"("leagueId", "year");
CREATE INDEX "Season_year_idx" ON "Season"("year");
CREATE INDEX "Season_isCurrent_idx" ON "Season"("isCurrent");

CREATE UNIQUE INDEX "Team_apiId_key" ON "Team"("apiId");
CREATE INDEX "Team_name_idx" ON "Team"("name");
CREATE INDEX "Team_country_idx" ON "Team"("country");

CREATE UNIQUE INDEX "Match_apiFixtureId_key" ON "Match"("apiFixtureId");
CREATE INDEX "Match_leagueId_idx" ON "Match"("leagueId");
CREATE INDEX "Match_seasonId_idx" ON "Match"("seasonId");
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

ALTER TABLE "Season" ADD CONSTRAINT "Season_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
