"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { registerDepositAction } from "@/features/deposits/actions";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Loader2,
  PiggyBank,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositButtonProps {
  amount: number;
  stepNumber: number;
}

export function DepositButton({
  amount,
  stepNumber,
}: DepositButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const progress = Math.min((stepNumber / 100) * 100, 100);
  const remainingSteps = Math.max(100 - stepNumber, 0);

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const handleDeposit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await registerDepositAction(amount, stepNumber);

      if (result?.success) {
        toast.success("Depósito registrado!", {
          description: `${formatBRL(amount)} foram adicionados ao seu desafio.`,
        });

        setShowModal(false);
        return;
      }

      toast.error("Não foi possível registrar", {
        description:
          result?.error ||
          "Ocorreu um erro ao registrar seu depósito. Tente novamente.",
      });
    } catch (error) {
      console.error(error);

      toast.error("Algo deu errado", {
        description:
          "Não conseguimos registrar o depósito. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fecha com ESC
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, isSubmitting]);

  // Evita scroll da página enquanto o modal está aberto
  useEffect(() => {
    if (!showModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal]);

  return (
    <>
      {/* BOTÃO PRINCIPAL (Minimalista e Sólido) */}
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
        className={cn(
          "h-14 w-full rounded-2xl",
          "bg-primary text-base font-semibold text-primary-foreground",
          "transition-colors hover:bg-primary/90",
          "active:scale-[0.98]"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          Guardar {formatBRL(amount)}
          <ArrowRight className="h-4 w-4" />
        </span>
      </Button>

      {/* MODAL */}
      {showModal && (
        <div
          className={cn(
            "fixed inset-0 z-[100]",
            "flex items-center justify-center p-4",
            "bg-black/90", // Fundo escuro sólido (sem vidro/blur)
            "animate-in fade-in duration-200"
          )}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-modal-title"
            className={cn(
              "relative w-full max-w-[400px] overflow-hidden",
              "rounded-3xl border border-zinc-800",
              "bg-zinc-950", // Fundo do card super escuro e opaco
              "shadow-2xl",
              "animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
            )}
          >
            {/* BOTÃO FECHAR */}
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label="Fechar"
              className={cn(
                "absolute right-4 top-4 z-20",
                "flex h-8 w-8 items-center justify-center rounded-full",
                "bg-zinc-900 text-zinc-400",
                "transition-colors hover:bg-zinc-800 hover:text-white",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              
              {/* ÍCONE (Sem glows e neons, apenas bloco sólido) */}
              <div className="mb-6 flex justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-primary">
                  <PiggyBank className="h-7 w-7" strokeWidth={2} />
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-zinc-950 bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </div>
                </div>
              </div>

              {/* TEXTO (Tipografia justa e limpa) */}
              <div className="text-center">
                <p className="mb-1 text-sm font-medium text-zinc-500 uppercase tracking-widest">
                  Valor do Depósito
                </p>

                <h2
                  id="deposit-modal-title"
                  className="text-4xl font-semibold tracking-tight text-white mb-2"
                >
                  {formatBRL(amount)}
                </h2>

                <p className="text-sm text-zinc-400">
                  Confirme para registrar este valor.
                </p>
              </div>

              {/* CARD DO PASSO (Flat design) */}
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Progresso
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-200">
                      Passo {stepNumber} de 100
                    </p>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {Math.round(progress)}%
                  </div>
                </div>

                {/* Barra de Progresso Fina e Elegante */}
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  {remainingSteps > 0 
                    ? "Cada depósito te aproxima da meta final." 
                    : "Última etapa do desafio."}
                </p>
              </div>

              {/* INFO SEGURANÇA */}
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-zinc-900 p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-zinc-400">
                  Confirme apenas se você já realizou a transferência do valor para a conta do desafio.
                </p>
              </div>

              {/* AÇÕES (Botões sólidos) */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl border-zinc-800 bg-transparent text-zinc-300 font-medium hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde
                    </span>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}