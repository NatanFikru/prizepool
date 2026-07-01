export const MOCK_MATCHES = [
  {
    id: "1",
    teamA: "France",
    teamB: "Senegal",
    league: "World Cup Qualifiers",
    kickoffTime: "2h 34m",
    boostActive: true,
    status: "upcoming",
    stats: {
      teamA: { percent: 65, label: "Favorite" },
      draw: { percent: 10, label: "Underdog" },
      teamB: { percent: 25, label: "Competitive" }
    }
  },
  {
    id: "2",
    teamA: "England",
    teamB: "Brazil",
    league: "International Friendly",
    kickoffTime: "5h 12m",
    boostActive: false,
    status: "upcoming",
    stats: {
      teamA: { percent: 45, label: "Competitive" },
      draw: { percent: 15, label: "Underdog" },
      teamB: { percent: 40, label: "Competitive" }
    }
  },
  {
    id: "3",
    teamA: "Spain",
    teamB: "Argentina",
    league: "International Friendly",
    kickoffTime: "1d 4h",
    boostActive: true,
    status: "upcoming",
    stats: {
      teamA: { percent: 50, label: "Competitive" },
      draw: { percent: 10, label: "Underdog" },
      teamB: { percent: 40, label: "Competitive" }
    }
  },
  {
    id: "4",
    teamA: "Arsenal",
    teamB: "Chelsea",
    league: "Premier League",
    kickoffTime: "LIVE",
    boostActive: false,
    status: "live",
    stats: {
      teamA: { percent: 55, label: "Favorite" },
      draw: { percent: 20, label: "Underdog" },
      teamB: { percent: 25, label: "Competitive" }
    }
  },
  {
    id: "5",
    teamA: "Real Madrid",
    teamB: "Barcelona",
    league: "La Liga",
    kickoffTime: "FT",
    boostActive: true,
    status: "completed",
    score: "2-1",
    winningOutcome: "teamA",
    stats: {
      teamA: { percent: 48, label: "Competitive" },
      draw: { percent: 12, label: "Underdog" },
      teamB: { percent: 40, label: "Competitive" }
    }
  },
  {
    id: "6",
    teamA: "Bayern Munich",
    teamB: "Man City",
    league: "Champions League",
    kickoffTime: "FT",
    boostActive: false,
    status: "completed",
    score: "1-1",
    winningOutcome: "draw",
    stats: {
      teamA: { percent: 60, label: "Favorite" },
      draw: { percent: 10, label: "Underdog" },
      teamB: { percent: 30, label: "Competitive" }
    }
  }
];

export const MOCK_TRANSACTIONS = [
  { id: "1", type: "Deposit", amount: "500 ETB", date: "Today, 14:30", status: "Completed" },
  { id: "2", type: "Reward", amount: "120 ETB", date: "Yesterday, 21:15", status: "Completed" },
  { id: "3", type: "Withdrawal", amount: "1000 ETB", date: "Oct 24, 09:00", status: "Completed" },
  { id: "4", type: "Deposit", amount: "200 ETB", date: "Oct 22, 16:45", status: "Completed" },
  { id: "5", type: "Reward", amount: "350 ETB", date: "Oct 20, 23:30", status: "Completed" }
];

export const MOCK_PICKS = {
  active: [
    { id: "1", match: "France vs Senegal", outcome: "France Win", stake: "100 ETB", status: "Pending", countdown: "2h 34m" },
    { id: "2", match: "England vs Brazil", outcome: "Draw", stake: "40 ETB", status: "Pending", countdown: "5h 12m" },
    { id: "3", match: "Arsenal vs Chelsea", outcome: "Arsenal Win", stake: "400 ETB", status: "Pending", countdown: "LIVE" }
  ],
  closed: [
    { id: "4", match: "Real Madrid vs Barcelona", outcome: "Real Madrid Win", stake: "100 ETB", result: "Won", reward: "120 ETB" },
    { id: "5", match: "Bayern Munich vs Man City", outcome: "Bayern Munich Win", stake: "40 ETB", result: "Lost", reward: "0 ETB" }
  ]
};

export const MOCK_RESULTS = [
  { id: "1", match: "Real Madrid vs Barcelona", date: "Oct 25, 2023", score: "2-1", winningOutcome: "Home Win", userPick: "Home Win", userPickCorrect: true, reward: "Reward: 120 ETB" },
  { id: "2", match: "Bayern Munich vs Man City", date: "Oct 24, 2023", score: "1-1", winningOutcome: "Draw", userPick: "Home Win", userPickCorrect: false, reward: "No reward" },
  { id: "3", match: "Juventus vs PSG", date: "Oct 22, 2023", score: "0-2", winningOutcome: "Away Win", userPick: null, userPickCorrect: null, reward: null },
  { id: "4", match: "AC Milan vs Inter", date: "Oct 20, 2023", score: "1-0", winningOutcome: "Home Win", userPick: "Home Win", userPickCorrect: true, reward: "Reward: 85 ETB" }
];

export const MOCK_USER_STATS = {
  totalPicks: 42,
  winRate: "58%",
  totalWon: "3,450 ETB"
};
