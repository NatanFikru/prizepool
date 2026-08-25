import { getFootballConfig } from "./config";

type ApiFootballEnvelope<T> = {
  get?: string;
  parameters?: Record<string, string>;
  errors?: unknown[] | Record<string, unknown>;
  results?: number;
  paging?: {
    current: number;
    total: number;
  };
  response?: T;
};

export type ApiFootballLeagueResponse = {
  league: {
    id: number;
    name: string;
    type?: string;
    logo?: string;
  };
  country: {
    name?: string;
    code?: string;
    flag?: string;
  };
  seasons: Array<{
    year: number;
    current: boolean;
  }>;
};

export type ApiFootballFixtureResponse = {
  fixture: {
    id: number;
    date: string;
    timestamp?: number;
    timezone?: string;
    venue?: {
      id?: number | null;
      name?: string | null;
      city?: string | null;
    };
    status: {
      long?: string | null;
      short?: string | null;
      elapsed?: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country?: string | null;
    logo?: string | null;
    season: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo?: string | null;
    };
    away: {
      id: number;
      name: string;
      logo?: string | null;
    };
  };
  goals: {
    home?: number | null;
    away?: number | null;
  };
  score?: unknown;
};

export type ApiFootballTeamResponse = {
  team: {
    id: number;
    name: string;
    country?: string | null;
    logo?: string | null;
  };
  venue?: {
    name?: string | null;
    city?: string | null;
  };
};

export class FootballApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code: "INVALID_API_KEY" | "RATE_LIMITED" | "API_UNAVAILABLE" | "INVALID_RESPONSE" | "API_ERROR" = "API_ERROR",
  ) {
    super(message);
    this.name = "FootballApiError";
  }
}

function hasApiErrors(errors: ApiFootballEnvelope<unknown>["errors"]) {
  if (!errors) {
    return false;
  }

  return Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0;
}

async function footballFetch<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const config = getFootballConfig();
  const url = new URL(`${config.baseUrl}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        "x-apisports-key": config.apiKey,
        Accept: "application/json",
      },
    });
  } catch {
    throw new FootballApiError("API-Football is unavailable.", undefined, "API_UNAVAILABLE");
  }

  const body = (await response.json().catch(() => null)) as ApiFootballEnvelope<T> | null;

  if (!response.ok || !body) {
    if (response.status === 401 || response.status === 403) {
      throw new FootballApiError("API-Football rejected the configured API key.", response.status, "INVALID_API_KEY");
    }

    if (response.status === 429) {
      throw new FootballApiError("API-Football rate limit exceeded.", response.status, "RATE_LIMITED");
    }

    if (response.status >= 500) {
      throw new FootballApiError("API-Football is unavailable.", response.status, "API_UNAVAILABLE");
    }

    throw new FootballApiError("API-Football request failed.", response.status, "API_ERROR");
  }

  if (hasApiErrors(body.errors)) {
    const serializedErrors = JSON.stringify(body.errors).toLowerCase();

    if (serializedErrors.includes("key") || serializedErrors.includes("account")) {
      throw new FootballApiError("API-Football rejected the configured API key.", response.status, "INVALID_API_KEY");
    }

    if (serializedErrors.includes("rate") || serializedErrors.includes("limit")) {
      throw new FootballApiError("API-Football rate limit exceeded.", response.status, "RATE_LIMITED");
    }

    throw new FootballApiError("API-Football returned an error response.", response.status, "API_ERROR");
  }

  if (!Array.isArray(body.response)) {
    throw new FootballApiError("API-Football returned an invalid response.", response.status, "INVALID_RESPONSE");
  }

  return body.response;
}

export async function fetchFootballLeague(apiLeagueId: number) {
  const response = await footballFetch<ApiFootballLeagueResponse[]>("/leagues", {
    id: apiLeagueId,
  });

  return response[0] ?? null;
}

export async function fetchFootballFixtures(input: {
  leagueId: number;
  season: number;
  from?: string;
  to?: string;
}) {
  return footballFetch<ApiFootballFixtureResponse[]>("/fixtures", {
    league: input.leagueId,
    season: input.season,
    from: input.from,
    to: input.to,
  });
}

export async function fetchFootballLiveFixtures(leagueIds: number[]) {
  return footballFetch<ApiFootballFixtureResponse[]>("/fixtures", {
    live: "all",
    league: leagueIds.join("-"),
  });
}

export async function fetchFootballTeams(input: { leagueId: number; season: number }) {
  return footballFetch<ApiFootballTeamResponse[]>("/teams", {
    league: input.leagueId,
    season: input.season,
  });
}
