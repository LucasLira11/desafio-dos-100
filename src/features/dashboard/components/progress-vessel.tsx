"use client";

import { Sparkles } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface ProgressVesselProps {
  percentage: number;
  totalSaved: number;
  totalTarget: number;
  myName: string;
  partnerName: string | null;
  myDepositsCount: number;
  partnerDepositsCount: number;
  myAmount: number;
  partnerAmount: number;
  individualTarget: number;
}

export function ProgressVessel({
  percentage,
  totalSaved,
  totalTarget,
  myName,
  partnerName,
  myDepositsCount,
  partnerDepositsCount,
  myAmount,
  partnerAmount,
  individualTarget
}: ProgressVesselProps) {
  
  const formatBRL = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalDeposits = myDepositsCount + partnerDepositsCount;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full flex justify-center py-6">
          <div className="relative w-48 h-64 rounded-full border border-border bg-muted/20 shadow-inner overflow-hidden cursor-pointer group transition-all hover:border-primary/50 hover:shadow-lg">
            
            {/* O líquido que enche usando a nova sintaxe do Tailwind v4 bg-linear-to-t */}
            <div 
              className="absolute bottom-0 w-full bg-linear-to-t from-primary/80 to-primary/20 backdrop-blur-sm transition-all duration-1000 ease-in-out group-hover:opacity-90"
              style={{ height: `${percentage}%` }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 space-y-2">
              <div className="bg-background/80 backdrop-blur-md text-primary h-12 w-12 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full">
                <span className="text-2xl font-bold text-foreground">
                  {percentage.toFixed(1).replace('.0', '')}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Conquista</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Guardado</p>
              <p className="text-2xl font-bold text-foreground">{formatBRL(totalSaved)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-xl font-bold text-primary">{percentage.toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
              <p className="text-sm font-medium text-foreground">{myName}</p>
              <p className="text-lg font-bold text-foreground">{formatBRL(myAmount)}</p>
              <p className="text-xs text-muted-foreground">{myDepositsCount} / 100 depósitos</p>
            </div>

            {partnerName ? (
              <div className="space-y-1 bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-sm font-medium text-foreground">{partnerName}</p>
                <p className="text-lg font-bold text-foreground">{formatBRL(partnerAmount)}</p>
                <p className="text-xs text-muted-foreground">{partnerDepositsCount} / 100 depósitos</p>
              </div>
            ) : (
              <div className="space-y-1 bg-muted/10 p-4 rounded-xl border border-dashed border-border flex items-center justify-center text-center">
                <p className="text-xs text-muted-foreground">Aguardando parceiro(a) entrar no desafio.</p>
              </div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-sm text-primary font-medium">
              Faltam {formatBRL(totalTarget - totalSaved)} para alcançarem a meta de {formatBRL(totalTarget)}!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}