"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { registerDepositAction } from "../actions";
import { toast } from "sonner";
import { Loader2, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositFormProps {
  currentStep: number;
  currentSaved: number;
}

export function DepositForm({ currentStep, currentSaved }: DepositFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // O desafio tem 100 passos. Se já completou, mostramos a tela de sucesso.
  const isCompleted = currentStep >= 100;
  
  // O próximo passo é o atual + 1 (ex: se fez 5, o próximo é 6).
  // E no Desafio dos 100, o valor do depósito é igual ao número do passo (Passo 6 = R$ 6).
  const nextStep = currentStep + 1;
  const amountToDeposit = nextStep;

  const formatBRL = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleDeposit = async () => {
    setIsSubmitting(true);
    
    // Chama a action que arrumamos algumas etapas atrás (com Push Notification e tudo!)
    const result = await registerDepositAction(amountToDeposit, nextStep);
    
    if (result.success) {
      toast.success(`R$ ${amountToDeposit} guardados com sucesso!`);
    } else {
      toast.error(result.error || "Erro ao registrar depósito.");
    }
    
    setIsSubmitting(false);
  };

  if (isCompleted) {
    return (
      <div className="bg-primary/10 border-2 border-primary rounded-3xl p-8 text-center space-y-4 animate-in zoom-in duration-500">
        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Desafio Concluído!</h2>
        <p className="text-muted-foreground">
          Vocês bateram a meta e guardaram incríveis <strong className="text-primary">{formatBRL(currentSaved)}</strong>!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Próximo Depósito
          </p>
          <p className="text-3xl font-black text-foreground">
            {formatBRL(amountToDeposit)}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
          <TrendingUp className="h-6 w-6" />
        </div>
      </div>

      <Button 
        onClick={handleDeposit} 
        disabled={isSubmitting} 
        className={cn(
          "w-full h-14 text-lg font-bold rounded-xl transition-all shadow-md",
          isSubmitting ? "opacity-70" : "hover:-translate-y-1 hover:shadow-lg"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Registrando...
          </>
        ) : (
          `Guardar ${formatBRL(amountToDeposit)}`
        )}
      </Button>
    </div>
  );
}