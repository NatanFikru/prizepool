"use client";

import { cn } from "@/lib/utils";
import { Flame, Target, Scale } from "lucide-react";

interface StatBadgeProps {
  percent: number;
  label: "Favorite" | "Underdog" | "Competitive";
  className?: string;
}

export default function StatBadge({ percent, label, className }: StatBadgeProps) {
  const getIcon = () => {
    switch (label) {
      case "Favorite": return <Flame size={12} className="text-primary" />;
      case "Underdog": return <Target size={12} className="text-destructive" />;
      case "Competitive": return <Scale size={12} className="text-blue-400" />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
        {getIcon()}
        <span>{label}</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            label === "Favorite" ? "bg-primary" : 
            label === "Underdog" ? "bg-destructive" : "bg-blue-400"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-semibold mt-1">{percent}%</span>
    </div>
  );
}
