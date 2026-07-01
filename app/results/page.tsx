"use client";

import PageHeader from "@/components/layout/PageHeader";
import { MOCK_RESULTS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

export default function Results() {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      <PageHeader title="Results" />

      <main className="p-4 space-y-4">
        {MOCK_RESULTS.map(result => (
          <Card key={result.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground font-medium">{result.date}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">FT</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex-1 truncate">{result.match.split(' vs ')[0]}</h3>
                <div className="px-4 text-xl font-black tracking-widest text-primary">{result.score}</div>
                <h3 className="font-bold text-lg flex-1 text-right truncate">{result.match.split(' vs ')[1]}</h3>
              </div>

              <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Winning Outcome</span>
                  <span className="font-bold text-sm text-primary flex items-center gap-1">
                    <Trophy size={14} />
                    {result.winningOutcome}
                  </span>
                </div>
                
                {result.userPick && (
                  <>
                    <div className="w-full h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Your Pick</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{result.userPick}</span>
                        {result.userPickCorrect ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-destructive" />
                        )}
                      </div>
                    </div>
                    {result.reward && (
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs font-bold ${result.userPickCorrect ? 'text-primary' : 'text-muted-foreground'}`}>
                          {result.reward}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
