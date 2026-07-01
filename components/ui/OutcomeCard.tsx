"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface OutcomeCardProps {
  label: string;
  percent: number;
  isSelected: boolean;
  selectedStake: number | null;
  onSelectOutcome: () => void;
  onSelectStake: (amount: number) => void;
}

export default function OutcomeCard({ 
  label, 
  percent, 
  isSelected, 
  selectedStake, 
  onSelectOutcome, 
  onSelectStake 
}: OutcomeCardProps) {
  
  const handleStakeClick = (e: React.MouseEvent, amount: number, isLocked: boolean) => {
    e.stopPropagation();
    if (!isLocked) {
      if (!isSelected) onSelectOutcome();
      onSelectStake(amount);
    }
  };

  const isBaseSelected = isSelected && selectedStake !== null;

  return (
    <motion.div 
      className={cn(
        "rounded-xl border-2 transition-all p-3 cursor-pointer",
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
      )}
      onClick={onSelectOutcome}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{percent}% pick this</span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-1 mb-4 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex gap-2">
        {/* 40 ETB - Base Stake */}
        <Button
          type="button"
          variant={isSelected && selectedStake === 40 ? "default" : "outline"}
          className={cn(
            "flex-1 h-10 text-xs font-bold",
            isSelected && selectedStake === 40 && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={(e) => handleStakeClick(e, 40, false)}
        >
          40 ETB
        </Button>

        {/* 100 ETB */}
        <Button
          type="button"
          variant={isSelected && selectedStake === 100 ? "default" : "outline"}
          className={cn(
            "flex-1 h-10 text-xs font-bold relative overflow-hidden",
            isSelected && selectedStake === 100 && "bg-primary text-primary-foreground hover:bg-primary/90",
            !isBaseSelected && "opacity-50"
          )}
          onClick={(e) => handleStakeClick(e, 100, !isBaseSelected)}
        >
          {!isBaseSelected && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Lock size={12} className="text-muted-foreground" />
            </div>
          )}
          100 ETB
        </Button>

        {/* 400 ETB */}
        <Button
          type="button"
          variant={isSelected && selectedStake === 400 ? "default" : "outline"}
          className={cn(
            "flex-1 h-10 text-xs font-bold relative overflow-hidden",
            isSelected && selectedStake === 400 && "bg-primary text-primary-foreground hover:bg-primary/90",
            !isBaseSelected && "opacity-50"
          )}
          onClick={(e) => handleStakeClick(e, 400, !isBaseSelected)}
        >
          {!isBaseSelected && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Lock size={12} className="text-muted-foreground" />
            </div>
          )}
          400 ETB
        </Button>
      </div>
    </motion.div>
  );
}
