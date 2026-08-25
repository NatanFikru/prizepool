export type SupportedCompetition = {
  key: string;
  apiLeagueId: number;
  name: string;
};

export const SUPPORTED_COMPETITIONS = [
  { key: "premier-league", apiLeagueId: 39, name: "Premier League" },
  { key: "la-liga", apiLeagueId: 140, name: "La Liga" },
  { key: "serie-a", apiLeagueId: 135, name: "Serie A" },
  { key: "bundesliga", apiLeagueId: 78, name: "Bundesliga" },
  { key: "ligue-1", apiLeagueId: 61, name: "Ligue 1" },
  { key: "uefa-champions-league", apiLeagueId: 2, name: "UEFA Champions League" },
  { key: "uefa-europa-league", apiLeagueId: 3, name: "UEFA Europa League" },
  { key: "fifa-world-cup", apiLeagueId: 1, name: "FIFA World Cup" },
  { key: "africa-cup-of-nations", apiLeagueId: 6, name: "Africa Cup of Nations" },
] as const satisfies readonly SupportedCompetition[];

export type SupportedCompetitionKey = (typeof SUPPORTED_COMPETITIONS)[number]["key"];

export function getSupportedCompetition(key: SupportedCompetitionKey) {
  return SUPPORTED_COMPETITIONS.find((competition) => competition.key === key);
}

export function supportedCompetitionIds() {
  return SUPPORTED_COMPETITIONS.map((competition) => competition.apiLeagueId);
}
