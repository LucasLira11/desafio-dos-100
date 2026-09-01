"use client";

import { cn } from "@/lib/utils";

interface ChallengeGridProps {
  completedSteps: number[];
}

export function ChallengeGrid({ completedSteps }: ChallengeGridProps) {
  // Cria um array de 1 a 100
  const allSteps = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Mapa do Desafio</h3>
          <p className="text-xs text-muted-foreground">Preencha todos os espaços para vencer.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {completedSteps.length}/100
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
        {allSteps.map((step) => {
          const isCompleted = completedSteps.includes(step);
          
          return (
            <div
              key={step}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-[10px] sm:text-xs transition-all duration-500",
                isCompleted 
                  ? "bg-primary text-primary-foreground font-bold shadow-sm scale-105" 
                  : "bg-muted/30 text-muted-foreground/40 font-medium"
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