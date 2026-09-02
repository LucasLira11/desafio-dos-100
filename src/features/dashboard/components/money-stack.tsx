"use client";

import { cn } from "@/lib/utils";

export function MoneyStack({ current, total }: { current: number, total: number }) {
  // Se o total é 100, teremos 10 maços (cada um vale 10 depósitos)
  const totalBundles = 10;
  const depositsPerBundle = total / totalBundles;
  
  // Quantos maços estão "completos"
  const filledBundles = Math.floor(current / depositsPerBundle);

  // Um ícone em formato de Maço de Dinheiro inspirado no seu logo
  const MoneyBundleIcon = ({ filled }: { filled: boolean }) => (
    <svg viewBox="0 0 100 50" className={cn("w-full h-8 transition-all duration-500", filled ? "scale-100 opacity-100" : "scale-95 opacity-20 grayscale")} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Corpo do Dinheiro (Verde se ativo, Cinza se inativo) */}
      <rect x="5" y="5" width="90" height="40" rx="6" fill={filled ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} stroke="hsl(var(--foreground))" strokeWidth="4"/>
      {/* Linhas das notas */}
      <line x1="5" y1="18" x2="95" y2="18" stroke="hsl(var(--foreground))" strokeWidth="4"/>
      <line x1="5" y1="31" x2="95" y2="31" stroke="hsl(var(--foreground))" strokeWidth="4"/>
      {/* Faixa Dourada no meio */}
      <rect x="35" y="5" width="30" height="40" fill={filled ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))"} stroke="hsl(var(--foreground))" strokeWidth="4"/>
    </svg>
  );

  return (
    <div className="flex flex-col items-center p-6 bg-card border border-border rounded-3xl shadow-lg relative overflow-hidden">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">A Pilha do Desafio</h3>
      
      {/* Renderiza de baixo para cima (flex-col-reverse) */}
      <div className="flex flex-col-reverse gap-1 w-32 relative z-10">
        {Array.from({ length: totalBundles }).map((_, i) => (
          <MoneyBundleIcon key={i} filled={i < filledBundles} />
        ))}
      </div>

      <div className="mt-6 text-center z-10">
        <p className="text-3xl font-black text-foreground">{current} <span className="text-lg font-medium text-muted-foreground">/ {total}</span></p>
        <p className="text-sm text-primary font-semibold mt-1">Passos Concluídos</p>
      </div>

      {/* Brilho de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
    </div>
  );
}