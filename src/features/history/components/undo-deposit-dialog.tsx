"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { undoDepositAction } from "@/features/deposits/actions";
import { toast } from "sonner";

interface UndoDepositDialogProps {
  depositId: string;
  amount: number;
  stepNumber: number;
}

export function UndoDepositDialog({ depositId, amount, stepNumber }: UndoDepositDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const formatBRL = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleConfirm = async () => {
    setIsPending(true);
    
    const result = await undoDepositAction(depositId);
    
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Depósito de ${formatBRL(amount)} desfeito.`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 mt-1">
          <Trash2 className="h-3 w-3" />
          Desfazer
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Desfazer Depósito</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja remover o depósito <strong className="text-foreground">#{stepNumber}</strong> no valor de <strong className="text-foreground">{formatBRL(amount)}</strong> do seu progresso?
          </p>
          
          <div className="flex gap-3 pt-4">
            <DialogClose asChild>
              <Button className="flex-1" disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm" 
              disabled={isPending} 
              onClick={handleConfirm}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, desfazer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}