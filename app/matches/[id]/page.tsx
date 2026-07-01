"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import OutcomeCard from "@/components/ui/OutcomeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_MATCHES } from "@/data/mockData";
import { Clock, Zap, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetMatch, useSubmitPick } from "@/lib/api";
import { useAppAuth } from "@/contexts/auth-context";

export default function MatchDetails() {
  const [, params] = useRoute("/match/:id");
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const matchId = params?.id ?? "";
  const { toast } = useToast();
  const { isAuthenticated, login } = useAppAuth();

  const [selectedOutcome, setSelectedOutcome] = useState<"home" | "draw" | "away" | null>(null);
  const [selectedStake, setSelectedStake] = useState<40 | 100 | 400 | null>(null);

  // Fetch real match data from API; fall back to mock while loading
  const { data: apiData, isLoading } = useGetMatch(matchId, { query: { enabled: !!matchId } });
  const apiMatch = apiData?.match;

  // Adapt API shape to the format used by OutcomeCard / display
  const match = apiMatch
    ? {
        id: apiMatch.id,
        teamA: apiMatch.homeTeam,
        teamB: apiMatch.awayTeam,
        league: apiMatch.league,
        kickoffTime: new Date(apiMatch.kickoffAt).toLocaleString(),
        boostActive: apiMatch.boostActive,
        status: apiMatch.status,
        stats: {
          teamA: { percent: apiMatch.homePercent, label: apiMatch.homeLabel },
          draw: { percent: apiMatch.drawPercent, label: apiMatch.drawLabel },
          teamB: { percent: apiMatch.awayPercent, label: apiMatch.awayLabel },
        },
      }
    : MOCK_MATCHES.find(m => m.id === matchId);

  // submitPick mutation — POST /api/picks
  const submitPick = useSubmitPick({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Prediction Confirmed!",
          description: `You placed ${selectedStake} ETB on ${
            selectedOutcome === "home" ? match?.teamA :
            selectedOutcome === "away" ? match?.teamB : "Draw"
          }`,
          className: "bg-primary text-primary-foreground border-none",
        });
        setLocation("/picks");
      },
      onError: (err: { response?: { data?: { error?: string } } }) => {
        const message = err?.response?.data?.error ?? "Failed to submit pick";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      },
    },
  });

  const handleSelectOutcome = (outcome: "home" | "draw" | "away") => {
    setSelectedOutcome(outcome);
    setSelectedStake(40);
  };

  const handleSelectStake = (amount: number) => {
    if (selectedOutcome && (amount === 40 || amount === 100 || amount === 400)) {
      setSelectedStake(amount as 40 | 100 | 400);
    }
  };

  const handleConfirm = () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!selectedOutcome || !selectedStake || !matchId) return;

    // Submit to real API — POST /api/picks
    submitPick.mutate({
      data: {
        matchId,
        outcome: selectedOutcome,
        stakeAmount: selectedStake,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return <div className="p-4 text-center mt-20">Match not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-background">
      <PageHeader title={`${match.teamA} vs ${match.teamB}`} showBack />

      <main className="flex-1 p-4 flex flex-col gap-6">
        {/* Match Header Info */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest">{match.league}</Badge>
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
            <Clock size={16} />
            {match.kickoffTime}
          </div>
          {match.boostActive && (
            <div className="flex items-center justify-center gap-1 text-sm font-bold text-primary bg-primary/10 py-1 px-3 rounded-full inline-flex mx-auto border border-primary/20">
              <Zap size={14} fill="currentColor" />
              PrizePool Boost Active
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary p-3 rounded-lg border border-border">
          <AlertCircle size={16} className="text-primary shrink-0" />
          <p>Predictions close 10 minutes before kickoff.</p>
        </div>

        {/* Outcomes */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg">Select Outcome &amp; Stake</h2>

          <OutcomeCard
            label={match.teamA}
            percent={match.stats.teamA.percent}
            isSelected={selectedOutcome === "home"}
            selectedStake={selectedOutcome === "home" ? selectedStake : null}
            onSelectOutcome={() => handleSelectOutcome("home")}
            onSelectStake={handleSelectStake}
          />

          <OutcomeCard
            label="Draw"
            percent={match.stats.draw.percent}
            isSelected={selectedOutcome === "draw"}
            selectedStake={selectedOutcome === "draw" ? selectedStake : null}
            onSelectOutcome={() => handleSelectOutcome("draw")}
            onSelectStake={handleSelectStake}
          />

          <OutcomeCard
            label={match.teamB}
            percent={match.stats.teamB.percent}
            isSelected={selectedOutcome === "away"}
            selectedStake={selectedOutcome === "away" ? selectedStake : null}
            onSelectOutcome={() => handleSelectOutcome("away")}
            onSelectStake={handleSelectStake}
          />
        </div>
      </main>

      {/* Fixed bottom action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] bg-card/95 backdrop-blur border-t border-border p-4 pointer-events-auto">
          <Button
            className="w-full h-14 text-lg font-bold"
            disabled={(!selectedOutcome || !selectedStake) || submitPick.isPending}
            onClick={handleConfirm}
            data-testid="button-confirm-prediction"
          >
            {submitPick.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isAuthenticated ? (
              "Confirm Prediction"
            ) : (
              "Sign In to Predict"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
