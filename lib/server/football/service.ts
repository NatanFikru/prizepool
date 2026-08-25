import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import {
  fetchFootballFixtures,
  fetchFootballLeague,
  fetchFootballLiveFixtures,
  fetchFootballTeams,
  type ApiFootballFixtureResponse,
  type ApiFootballLeagueResponse,
  type ApiFootballTeamResponse,
} from "./client";
import {
  getSupportedCompetition,
  SUPPORTED_COMPETITIONS,
  supportedCompetitionIds,
  type SupportedCompetition,
  type SupportedCompetitionKey,
} from "./competitions";
import { fixtureLastUpdated, fixtureVenue, mapFixtureStatus } from "./mappers";

type SyncFixturesInput = {
  season: number;
  from?: string;
  to?: string;
  competitions?: readonly SupportedCompetition[];
};

type SyncUpcomingFixturesInput = {
  season: number;
  daysAhead?: number;
  maxMatches?: number;
  competitionKeys?: SupportedCompetitionKey[];
};

type SyncResult = {
  leagues: number;
  seasons: number;
  teams: number;
  matches: number;
};

const emptySyncResult = (): SyncResult => ({
  leagues: 0,
  seasons: 0,
  teams: 0,
  matches: 0,
});

function addSyncResult(target: SyncResult, source: SyncResult) {
  target.leagues += source.leagues;
  target.seasons += source.seasons;
  target.teams += source.teams;
  target.matches += source.matches;
}

function isoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function competitionsForKeys(keys: SupportedCompetitionKey[] | undefined): SupportedCompetition[] {
  if (!keys?.length) {
    return SUPPORTED_COMPETITIONS.slice(0, 3);
  }

  return keys.reduce<SupportedCompetition[]>((competitions, key) => {
    const competition = getSupportedCompetition(key);

    if (competition) {
      competitions.push(competition);
    }

    return competitions;
  }, []);
}

async function upsertLeagueAndSeason(
  tx: Prisma.TransactionClient,
  leagueResponse: ApiFootballLeagueResponse | null,
  fixture: ApiFootballFixtureResponse,
) {
  const league = await tx.league.upsert({
    where: { apiId: fixture.league.id },
    create: {
      apiId: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country,
      logo: fixture.league.logo,
    },
    update: {
      name: fixture.league.name,
      country: fixture.league.country,
      logo: fixture.league.logo,
    },
  });
  const seasonInfo = leagueResponse?.seasons.find((season) => season.year === fixture.league.season);
  const isCurrent = seasonInfo?.current;
  const season = await tx.season.upsert({
    where: {
      leagueId_year: {
        leagueId: league.id,
        year: fixture.league.season,
      },
    },
    create: {
      leagueId: league.id,
      year: fixture.league.season,
      isCurrent: isCurrent ?? false,
    },
    update: isCurrent === undefined ? {} : { isCurrent },
  });

  return { league, season };
}

async function upsertFixtureTeam(
  tx: Prisma.TransactionClient,
  fixtureTeam: ApiFootballFixtureResponse["teams"]["home"],
  teamResponse: ApiFootballTeamResponse | undefined,
) {
  return tx.team.upsert({
    where: { apiId: fixtureTeam.id },
    create: {
      apiId: fixtureTeam.id,
      name: fixtureTeam.name,
      country: teamResponse?.team.country,
      logo: fixtureTeam.logo ?? teamResponse?.team.logo,
      venueName: teamResponse?.venue?.name,
      venueCity: teamResponse?.venue?.city,
    },
    update: {
      name: fixtureTeam.name,
      country: teamResponse?.team.country,
      logo: fixtureTeam.logo ?? teamResponse?.team.logo,
      venueName: teamResponse?.venue?.name,
      venueCity: teamResponse?.venue?.city,
    },
  });
}

function teamResponseMap(teams: ApiFootballTeamResponse[]) {
  return new Map(teams.map((team) => [team.team.id, team]));
}

async function syncFixtureBatch(input: {
  fixtures: ApiFootballFixtureResponse[];
  leagueResponse: ApiFootballLeagueResponse | null;
  teamsByApiId: Map<number, ApiFootballTeamResponse>;
}) {
  const result = emptySyncResult();

  try {
    await prisma.$transaction(async (tx) => {
      for (const fixture of input.fixtures) {
        const { league, season } = await upsertLeagueAndSeason(tx, input.leagueResponse, fixture);
        const homeTeam = await upsertFixtureTeam(tx, fixture.teams.home, input.teamsByApiId.get(fixture.teams.home.id));
        const awayTeam = await upsertFixtureTeam(tx, fixture.teams.away, input.teamsByApiId.get(fixture.teams.away.id));
        const venue = fixtureVenue(fixture);

        await tx.match.upsert({
          where: { apiFixtureId: fixture.fixture.id },
          create: {
            apiFixtureId: fixture.fixture.id,
            leagueId: league.id,
            seasonId: season.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startsAt: new Date(fixture.fixture.date),
            venueName: venue.venueName,
            venueCity: venue.venueCity,
            status: mapFixtureStatus(fixture.fixture.status.short),
            apiStatusShort: fixture.fixture.status.short,
            apiStatusLong: fixture.fixture.status.long,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            lastUpdated: fixtureLastUpdated(fixture),
          },
          update: {
            leagueId: league.id,
            seasonId: season.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startsAt: new Date(fixture.fixture.date),
            venueName: venue.venueName,
            venueCity: venue.venueCity,
            status: mapFixtureStatus(fixture.fixture.status.short),
            apiStatusShort: fixture.fixture.status.short,
            apiStatusLong: fixture.fixture.status.long,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            lastUpdated: fixtureLastUpdated(fixture),
          },
        });

        result.matches += 1;
      }
    });
  } catch (error) {
    console.error("Football fixture database synchronization failed", {
      fixtureCount: input.fixtures.length,
      error,
    });
    throw error;
  }

  result.leagues = new Set(input.fixtures.map((fixture) => fixture.league.id)).size;
  result.seasons = new Set(input.fixtures.map((fixture) => `${fixture.league.id}:${fixture.league.season}`)).size;
  result.teams = new Set(input.fixtures.flatMap((fixture) => [fixture.teams.home.id, fixture.teams.away.id])).size;

  return result;
}

export async function importFixtures(input: SyncFixturesInput) {
  const total = emptySyncResult();
  const competitions = input.competitions ?? SUPPORTED_COMPETITIONS;

  console.info("Football fixture import started", {
    season: input.season,
    from: input.from,
    to: input.to,
    competitions: competitions.map((competition) => competition.key),
  });

  for (const competition of competitions) {
    const [leagueResponse, teamResponses, fixtures] = await Promise.all([
      fetchFootballLeague(competition.apiLeagueId),
      fetchFootballTeams({ leagueId: competition.apiLeagueId, season: input.season }),
      fetchFootballFixtures({
        leagueId: competition.apiLeagueId,
        season: input.season,
        from: input.from,
        to: input.to,
      }),
    ]);

    addSyncResult(
      total,
      await syncFixtureBatch({
        fixtures,
        leagueResponse,
        teamsByApiId: teamResponseMap(teamResponses),
      }),
    );
  }

  console.info("Football fixture import completed", total);

  return total;
}

export async function importUpcomingFixtures(input: SyncUpcomingFixturesInput) {
  const now = new Date();
  const to = new Date(now);
  const maxMatches = Math.min(Math.max(input.maxMatches ?? 12, 1), 50);
  const daysAhead = Math.min(Math.max(input.daysAhead ?? 14, 1), 60);
  const competitions = competitionsForKeys(input.competitionKeys);

  to.setUTCDate(to.getUTCDate() + daysAhead);

  const total = emptySyncResult();
  let importedMatches = 0;

  console.info("Controlled football upcoming fixture import started", {
    season: input.season,
    from: isoDateOnly(now),
    to: isoDateOnly(to),
    maxMatches,
    competitions: competitions.map((competition) => competition.key),
  });

  for (const competition of competitions) {
    if (importedMatches >= maxMatches) {
      break;
    }

    const [leagueResponse, teamResponses, fixtures] = await Promise.all([
      fetchFootballLeague(competition.apiLeagueId),
      fetchFootballTeams({ leagueId: competition.apiLeagueId, season: input.season }),
      fetchFootballFixtures({
        leagueId: competition.apiLeagueId,
        season: input.season,
        from: isoDateOnly(now),
        to: isoDateOnly(to),
      }),
    ]);
    const upcomingFixtures = fixtures
      .filter((fixture) => new Date(fixture.fixture.date).getTime() > now.getTime())
      .sort((left, right) => new Date(left.fixture.date).getTime() - new Date(right.fixture.date).getTime())
      .slice(0, maxMatches - importedMatches);
    const result = await syncFixtureBatch({
      fixtures: upcomingFixtures,
      leagueResponse,
      teamsByApiId: teamResponseMap(teamResponses),
    });

    addSyncResult(total, result);
    importedMatches += result.matches;
  }

  console.info("Controlled football upcoming fixture import completed", total);

  return total;
}

export async function updateLiveMatches() {
  const fixtures = await fetchFootballLiveFixtures(supportedCompetitionIds());

  return syncFixtureBatch({
    fixtures,
    leagueResponse: null,
    teamsByApiId: new Map(),
  });
}

export async function updateFinishedMatches(input: SyncFixturesInput) {
  return importFixtures(input);
}
