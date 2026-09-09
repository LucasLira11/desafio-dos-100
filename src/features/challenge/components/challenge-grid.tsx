"use client";

import { cn } from "@/lib/utils";

interface ChallengeGridProps {
  completedSteps: number[];
  color?: string;
}

export function ChallengeGrid({ completedSteps, color }: ChallengeGridProps) {
  const fillColor = color || "hsl(var(--primary))";

  return (
    <div className="bg-card border border-border p-6 rounded-2xl">
      {/* Grid com 5 colunas no celular e 10 no PC */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3 place-items-center">
        {Array.from({ length: 100 }).map((_, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);

          return (
            <div
              key={step}
              className={cn(
                "relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-lg border text-sm transition-colors duration-300",
                isCompleted ? "border-transparent bg-muted/40" : "bg-transparent border-border text-muted-foreground/40"
              )}
            >
              {/* Corte diagonal: preenche o canto inferior direito com a cor do usuário */}
              {isCompleted && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: fillColor, clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                />
              )}
              <span className={cn("relative z-10", isCompleted ? "font-bold text-white" : "font-normal")}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
