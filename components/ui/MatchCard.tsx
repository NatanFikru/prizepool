"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";
import StatBadge from "./StatBadge";
import { motion } from "framer-motion";

interface MatchCardProps {
  match: {
    id: string;
    teamA: string;
    teamB: string;
    league: string;
    kickoffTime: string;
    boostActive: boolean;
    status: string;
    score?: string;
    winningOutcome?: string;
    stats: {
      teamA: { percent: number; label: "Favorite" | "Underdog" | "Competitive" };
      draw: { percent: number; label: "Favorite" | "Underdog" | "Competitive" };
      teamB: { percent: number; label: "Favorite" | "Underdog" | "Competitive" };
    };
  };
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card className="bg-card border-border overflow-hidden relative">
        {match.boostActive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        )}
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{match.league}</span>
              <div className="flex items-center gap-2 mt-1">
                {match.status === "live" ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[10px]">
                    Live Now
                  </Badge>
                ) : match.status === "completed" ? (
                  <Badge variant="outline" className="bg-secondary text-muted-foreground border-border uppercase text-[10px]">
                    FT
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <Clock size={14} />
                    <span>{match.kickoffTime}</span>
                  </div>
                )}
              </div>
            </div>
            {match.boostActive && (
              <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                <Zap size={12} fill="currentColor" />
                <span className="text-[10px] uppercase font-bold">Boost Active</span>
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 text-center">
              <div className="font-bold text-lg mb-1">{match.teamA}</div>
            </div>
            <div className="px-4 text-center">
              {match.score ? (
                <div className="text-2xl font-bold text-primary">{match.score}</div>
              ) : (
                <div className="text-muted-foreground font-bold italic">VS</div>
              )}
            </div>
            <div className="flex-1 text-center">
              <div className="font-bold text-lg mb-1">{match.teamB}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatBadge percent={match.stats.teamA.percent} label={match.stats.teamA.label} />
            <StatBadge percent={match.stats.draw.percent} label={match.stats.draw.label} />
            <StatBadge percent={match.stats.teamB.percent} label={match.stats.teamB.label} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
