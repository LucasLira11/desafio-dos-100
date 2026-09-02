"use client";

import { cn } from "@/lib/utils";

interface ProgressVesselProps {
  percentage: number;
  totalSaved?: number;
  totalTarget?: number;
}

export function ProgressVessel({ percentage = 0 }: ProgressVesselProps) {
  // Ícone de nota de dinheiro caindo
  const FallingMoney = ({ delay, left }: { delay: string, left: string }) => (
    <svg 
      viewBox="0 0 100 50" 
      className={cn("absolute w-8 h-4 opacity-0 money-drop", delay, left)} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="5" y="5" width="90" height="40" rx="4" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="3"/>
      <rect x="40" y="5" width="20" height="40" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3"/>
    </svg>
  );

  return (
    <div className="relative py-8 flex justify-center">
      
      {/* Estilos da Animação de Queda */}
      <style>{`
        @keyframes drop {
          0% { transform: translateY(-20px) rotate(-15deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(180px) rotate(15deg); opacity: 0; }
        }
        .money-drop { animation: drop 2.5s infinite ease-in; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 1.1s; }
        .delay-3 { animation-delay: 1.8s; }
        .left-1 { left: 25%; }
        .left-2 { left: 50%; }
        .left-3 { left: 70%; }
      `}</style>

      {/* Fio segurando a cápsula */}
      <div className="absolute top-0 left-1/2 w-1 h-10 bg-border/50 -translate-x-1/2 z-0" />

      {/* Cápsula de Vidro */}
      <div className="relative w-56 h-56 rounded-full border-[6px] border-border/30 bg-background/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center z-10">
        
        {/* Notas Caindo (Só aparecem se a cápsula não estiver 100% cheia) */}
        {percentage < 100 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <FallingMoney delay="delay-1" left="left-1" />
            <FallingMoney delay="delay-2" left="left-2" />
            <FallingMoney delay="delay-3" left="left-3" />
          </div>
        )}

        {/* Líquido Subindo */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-primary/60 backdrop-blur-lg transition-all duration-1000 ease-out z-20 border-t border-primary/40 shadow-[0_-10px_20px_rgba(22,163,74,0.3)]"
          style={{ height: `${percentage}%` }}
        />

        {/* Textos no Centro */}
        <div className="relative z-30 text-center drop-shadow-xl flex flex-col items-center">
          <p className="text-4xl font-black text-white">
            {percentage.toFixed(0)}%
          </p>
          <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">
            Concluído
          </p>
        </div>

        {/* Brilho de Reflexo do Vidro */}
        <div className="absolute top-4 left-6 w-16 h-8 bg-white/10 rounded-full rotate-[-30deg] z-40 blur-[2px]" />
      </div>
    </div>
  );
}