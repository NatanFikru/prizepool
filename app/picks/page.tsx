"use client";

import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_PICKS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useListMyPicks, useListMatches } from "@/lib/api";
import { useAppAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function MyPicks() {
  const { isAuthenticated, login } = useAppAuth();

  // Fetch real picks from API — GET /api/picks (requires auth)
  const { data: picksData, isLoading: picksLoading } = useListMyPicks({
    query: { enabled: isAuthenticated },
  });

  // Also fetch matches so we can show team names next to each pick
  const { data: matchesData } = useListMatches({
    query: { enabled: isAuthenticated },
  });

  const matchesById = Object.fromEntries(
    (matchesData?.matches ?? []).map(m => [m.id, m])
  );

  const apiPicks = picksData?.picks ?? [];

  // Separate active (pending) vs closed (won/lost)
  const activePicks = apiPicks.filter(p => p.status === "pending");
  const closedPicks = apiPicks.filter(p => p.status === "won" || p.status === "lost");

  // Label a pick's outcome in plain English
  const outcomeLabel = (outcome: string, matchId: string) => {
    const m = matchesById[matchId];
    if (!m) return outcome;
    if (outcome === "home") return `${m.homeTeam} Win`;
    if (outcome === "away") return `${m.awayTeam} Win`;
    return "Draw";
  };

  const matchLabel = (matchId: string) => {
    const m = matchesById[matchId];
    return m ? `${m.homeTeam} vs ${m.awayTeam}` : matchId;
  };

  const kickoffCountdown = (matchId: string) => {
    const m = matchesById[matchId];
    if (!m) return "—";
    if (m.status === "live") return "LIVE";
    const diff = new Date(m.kickoffAt).getTime() - Date.now();
    if (diff <= 0) return "Starting";
    const h = Math.floor(diff / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${min}m`;
  };

  // Not authenticated — prompt sign-in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <PageHeader title="My Picks" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">Sign in to view your picks.</p>
          <Button onClick={login} className="font-bold" data-testid="button-login-picks">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Use mock data when API hasn't returned real picks yet
  const hasMockFallback = !picksLoading && apiPicks.length === 0;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <PageHeader title="My Picks" />

      <main className="p-4 flex-1">
        {picksLoading && (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card border border-border">
            <TabsTrigger value="active">
              Active
              {activePicks.length > 0 && (
                <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 rounded-full">
                  {activePicks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 outline-none">
            {/* Real API picks */}
            {activePicks.map(pick => (
              <Card key={pick.id} className="bg-card border-border overflow-hidden" data-testid={`card-pick-${pick.id}`}>
                <div className="h-1 bg-primary/20 w-full" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-secondary text-muted-foreground border-border">
                        Pending
                      </Badge>
                      <h3 className="font-bold">{matchLabel(pick.matchId)}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      <Clock size={12} />
                      {kickoffCountdown(pick.matchId)}
                    </div>
                  </div>

                  <div className="bg-secondary rounded-lg p-3 flex justify-between items-center border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Pick</p>
                      <p className="font-bold">{outcomeLabel(pick.outcome, pick.matchId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Stake</p>
                      <p className="font-bold text-primary">{pick.stakeAmount} ETB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Mock fallback when no real picks yet */}
            {hasMockFallback && MOCK_PICKS.active.map(pick => (
              <Card key={pick.id} className="bg-card border-border overflow-hidden opacity-50">
                <div className="h-1 bg-primary/20 w-full" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-secondary text-muted-foreground border-border">{pick.status}</Badge>
                      <h3 className="font-bold">{pick.match}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      <Clock size={12} />
                      {pick.countdown}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 flex justify-between items-center border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Pick</p>
                      <p className="font-bold">{pick.outcome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Stake</p>
                      <p className="font-bold text-primary">{pick.stake}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!picksLoading && activePicks.length === 0 && !hasMockFallback && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No active picks. Go predict a match!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 outline-none">
            {closedPicks.map(pick => (
              <Card key={pick.id} className="bg-card border-border overflow-hidden" data-testid={`card-pick-closed-${pick.id}`}>
                <div className={`h-1 w-full ${pick.status === "won" ? "bg-green-500" : "bg-destructive"}`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold">{matchLabel(pick.matchId)}</h3>
                    <Badge variant="outline" className={`border ${
                      pick.status === "won"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {pick.status === "won"
                        ? <><CheckCircle2 size={12} className="mr-1" />Won</>
                        : <><XCircle size={12} className="mr-1" />Lost</>}
                    </Badge>
                  </div>

                  <div className="bg-secondary rounded-lg p-3 grid grid-cols-3 gap-2 border border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Pick</p>
                      <p className="font-bold text-sm truncate">{outcomeLabel(pick.outcome, pick.matchId)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Stake</p>
                      <p className="font-bold text-sm">{pick.stakeAmount} ETB</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Reward</p>
                      <p className={`font-bold text-sm ${pick.status === "won" ? "text-primary" : "text-muted-foreground"}`}>
                        {pick.rewardAmount != null ? `${pick.rewardAmount} ETB` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Mock fallback */}
            {hasMockFallback && MOCK_PICKS.closed.map(pick => (
              <Card key={pick.id} className="bg-card border-border overflow-hidden opacity-50">
                <div className={`h-1 w-full ${pick.result === "Won" ? "bg-green-500" : "bg-destructive"}`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold">{pick.match}</h3>
                    <Badge variant="outline" className={`border ${
                      pick.result === "Won"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {pick.result === "Won"
                        ? <><CheckCircle2 size={12} className="mr-1" />Won</>
                        : <><XCircle size={12} className="mr-1" />Lost</>}
                    </Badge>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 grid grid-cols-3 gap-2 border border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Pick</p>
                      <p className="font-bold text-sm truncate">{pick.outcome}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Stake</p>
                      <p className="font-bold text-sm">{pick.stake}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Reward</p>
                      <p className={`font-bold text-sm ${pick.result === "Won" ? "text-primary" : "text-muted-foreground"}`}>
                        {pick.reward}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!picksLoading && closedPicks.length === 0 && !hasMockFallback && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No closed picks yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
