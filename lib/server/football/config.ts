const DEFAULT_FOOTBALL_API_BASE_URL = "https://v3.football.api-sports.io";

type FootballConfig = {
  apiKey: string;
  baseUrl: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getFootballConfig(): FootballConfig {
  return {
    apiKey: requiredEnv("FOOTBALL_API_KEY"),
    baseUrl: (process.env.FOOTBALL_API_BASE_URL?.trim() || DEFAULT_FOOTBALL_API_BASE_URL).replace(/\/+$/, ""),
  };
}
