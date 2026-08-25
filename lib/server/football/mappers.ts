import { MatchStatus } from "@/lib/generated/prisma/client";
import type { ApiFootballFixtureResponse } from "./client";

const LIVE_STATUS_CODES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED_STATUS_CODES = new Set(["FT", "AET", "PEN"]);
const CANCELLED_STATUS_CODES = new Set(["CANC", "ABD", "AWD", "WO"]);
const POSTPONED_STATUS_CODES = new Set(["PST"]);

export function mapFixtureStatus(statusShort: string | null | undefined): MatchStatus {
  const normalized = statusShort?.toUpperCase() ?? "";

  if (LIVE_STATUS_CODES.has(normalized)) {
    return MatchStatus.LIVE;
  }

  if (FINISHED_STATUS_CODES.has(normalized)) {
    return MatchStatus.FINISHED;
  }

  if (CANCELLED_STATUS_CODES.has(normalized)) {
    return MatchStatus.CANCELLED;
  }

  if (POSTPONED_STATUS_CODES.has(normalized)) {
    return MatchStatus.POSTPONED;
  }

  return MatchStatus.SCHEDULED;
}

export function fixtureLastUpdated(fixture: ApiFootballFixtureResponse) {
  return new Date();
}

export function fixtureVenue(fixture: ApiFootballFixtureResponse) {
  return {
    venueName: fixture.fixture.venue?.name ?? null,
    venueCity: fixture.fixture.venue?.city ?? null,
  };
}
