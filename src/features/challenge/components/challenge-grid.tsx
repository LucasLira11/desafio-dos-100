"use client";

import { cn } from "@/lib/utils";

interface ChallengeGridProps {
  completedSteps: number[];
}

export function ChallengeGrid({ completedSteps }: ChallengeGridProps) {
  return (
    <div className="bg-card border border-border p-4 sm:p-6 rounded-3xl shadow-sm">
      {/* Grid com 5 colunas no celular e 10 no PC */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3 place-items-center">
        {Array.from({ length: 100 }).map((_, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);

          return (
            <div
              key={step}
              className={cn(
                "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border-2 text-sm transition-all duration-500",
                isCompleted 
                  ? "bg-primary border-primary text-primary-foreground font-black shadow-[0_0_15px_rgba(22,163,74,0.5)] scale-110 z-10" 
                  : "bg-muted/10 border-border/50 text-muted-foreground/30 hover:border-primary/30"
              )}
            >
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}