"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { registerDepositAction } from "@/features/deposits/actions";
import { toast } from "sonner";

interface DepositButtonProps {
  amount: number;
  stepNumber: number;
}

export function DepositButton({ amount, stepNumber }: DepositButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const formatBRL = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleConfirm = async () => {
    setIsPending(true);
    
    const result = await registerDepositAction(amount, stepNumber);
    
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${formatBRL(amount)} adicionados ao desafio 🎉`);
      setIsOpen(false);
      // Força o Next.js a buscar os dados mais recentes do servidor e repintar a tela
      router.refresh(); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-6 gap-2 shadow-sm">
          Depositar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Depósito</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 text-center">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 inline-block">
            <p className="text-sm font-medium text-primary mb-1">Depósito #{stepNumber}</p>
            <p className="text-4xl font-bold text-foreground">{formatBRL(amount)}</p>
          </div>
          
          <p className="text-muted-foreground text-sm max-w-70 mx-auto">
            Você confirma que já guardou este valor fisicamente ou na sua conta bancária separada?
          </p>

          <div className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleConfirm} className="flex-1" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, já guardei"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}