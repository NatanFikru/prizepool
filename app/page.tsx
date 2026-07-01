"use client";

import { Bell, Trophy, Users, Zap, Hash, Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MatchCard from "@/components/ui/MatchCard";
import { MOCK_MATCHES } from "@/data/mockData";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const upcomingMatches = MOCK_MATCHES.filter(m => m.status === "upcoming");

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-black tracking-widest italic text-xl">
          <Trophy fill="currentColor" size={24} />
          PRIZEPOOL
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
          </button>
          <Avatar className="w-8 h-8 border border-border cursor-pointer" onClick={() => setLocation('/profile')}>
            <AvatarFallback className="bg-secondary text-xs font-bold">JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-4 space-y-8 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-4"
        >
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Predict football.<br />
            <span className="text-primary">Win rewards.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
            Join exclusive prize pools and compete with other fans.
          </p>
        </motion.div>

        {/* Why PrizePool Section */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            Why PrizePool?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <Users size={20} className="text-primary" />
              <p className="text-xs font-medium text-muted-foreground leading-snug">The more users participate, the larger PrizePools become.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <Activity size={20} className="text-blue-400" />
              <p className="text-xs font-medium text-muted-foreground leading-snug">Choose wisely. Underdogs may reward more.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <Hash size={20} className="text-purple-400" />
              <p className="text-xs font-medium text-muted-foreground leading-snug">Every match is a unique event.</p>
            </div>
            <div className="bg-card border border-primary/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5" />
              <Zap size={20} className="text-primary relative z-10" fill="currentColor" />
              <p className="text-xs font-medium text-primary relative z-10 leading-snug">Look for PrizePool Boost Active matches.</p>
            </div>
          </div>
        </section>

        {/* Upcoming Matches */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy size={18} className="text-primary" />
              Upcoming Matches
            </h2>
            <button 
              onClick={() => setLocation('/matches')}
              className="text-xs text-primary font-bold hover:underline"
            >
              See All
            </button>
          </div>
          <div className="space-y-4">
            {upcomingMatches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <MatchCard 
                  match={match} 
                  onClick={() => setLocation(`/match/${match.id}`)} 
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
