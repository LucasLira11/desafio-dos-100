"use client";

import { Flame, Medal, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgesShowcaseProps {
  depositsCount: number;
  totalSaved: number;
}

export function BadgesShowcase({ depositsCount, totalSaved }: BadgesShowcaseProps) {
  // Lógica das conquistas
  const badges = [
    {
      id: "first",
      title: "O Início",
      description: "Deu o primeiro passo.",
      icon: Flame,
      unlocked: depositsCount >= 1,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      id: "ten",
      title: "Constância",
      description: "Completou 10 depósitos.",
      icon: Medal,
      unlocked: depositsCount >= 10,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "half",
      title: "Meio Caminho",
      description: "Chegou na metade (50).",
      icon: Star,
      unlocked: depositsCount >= 50,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      id: "boss",
      title: "A Conquista",
      description: "Finalizou os 100 depósitos!",
      icon: Trophy,
      unlocked: depositsCount >= 100,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div 
            key={badge.id}
            className={cn(
              "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2",
              badge.unlocked 
                ? "bg-card border-border shadow-sm" 
                : "bg-muted/10 border-dashed border-border/50 opacity-60 grayscale"
            )}
          >
            <div className={cn("p-3 rounded-full", badge.unlocked ? badge.bg : "bg-muted")}>
              <Icon className={cn("h-6 w-6", badge.unlocked ? badge.color : "text-muted-foreground")} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{badge.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}