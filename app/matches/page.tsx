"use client";

import PageHeader from "@/components/layout/PageHeader";
import MatchCard from "@/components/ui/MatchCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_MATCHES } from "@/data/mockData";
import { motion } from "framer-motion";
import { useListMatches } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Data adapter ─────────────────────────────────────────────────────────────
// Converts the API Match shape into the MatchCard prop shape.
// When Codex connects the backend fully, the MatchCard component can be
// updated to accept the API type directly and this adapter removed.
function adaptApiMatch(m: {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffAt: string;
  boostActive: boolean;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
  homeLabel: string;
  drawLabel: string;
  awayLabel: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  winningOutcome?: string | null;
}) {
  const kickoffDate = new Date(m.kickoffAt);
  const now = new Date();
  const diffMs = kickoffDate.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let kickoffTime: string;
  if (m.status === "live") kickoffTime = "LIVE";
  else if (m.status === "completed") kickoffTime = m.homeScore != null ? `${m.homeScore}-${m.awayScore}` : "FT";
  else if (diffH >= 24) kickoffTime = `${Math.floor(diffH / 24)}d ${diffH % 24}h`;
  else kickoffTime = `${diffH}h ${diffM}m`;

  return {
    id: m.id,
    teamA: m.homeTeam,
    teamB: m.awayTeam,
    league: m.league,
    kickoffTime,
    boostActive: m.boostActive,
    status: m.status as "upcoming" | "live" | "completed",
    score: m.homeScore != null ? `${m.homeScore}-${m.awayScore}` : undefined,
    winningOutcome: m.winningOutcome ?? undefined,
    stats: {
      teamA: { percent: m.homePercent, label: m.homeLabel },
      draw: { percent: m.drawPercent, label: m.drawLabel },
      teamB: { percent: m.awayPercent, label: m.awayLabel },
    },
  };
}

export default function Matches() {
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);

  // Fetch matches from the real API.
  // Falls back to mock data if the API hasn't returned yet or errors.
  const { data: apiData, isLoading, isError } = useListMatches();
  const apiMatches = apiData?.matches ?? [];
  const matches = apiMatches.length > 0
    ? apiMatches.map(adaptApiMatch)
    : MOCK_MATCHES;

  const upcomingMatches = matches.filter(m => m.status === "upcoming");
  const liveMatches = matches.filter(m => m.status === "live");
  const completedMatches = matches.filter(m => m.status === "completed");

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <PageHeader title="Matches" />

      <main className="p-4 flex-1">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card border border-border">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:text-green-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {upcomingMatches.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <MatchCard match={match} onClick={() => setLocation(`/match/${match.id}`)} />
              </motion.div>
            ))}
            {!isLoading && upcomingMatches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No upcoming matches.</div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-4 outline-none">
            {liveMatches.length > 0 ? liveMatches.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <MatchCard match={match} onClick={() => setLocation(`/match/${match.id}`)} />
              </motion.div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No live matches right now.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 outline-none">
            {completedMatches.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <MatchCard match={match} onClick={() => setLocation(`/match/${match.id}`)} />
              </motion.div>
            ))}
            {!isLoading && completedMatches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No completed matches yet.</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
