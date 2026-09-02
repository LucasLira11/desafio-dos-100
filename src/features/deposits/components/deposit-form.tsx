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
  Sparkles,
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
      {/* BOTÃO PRINCIPAL */}
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
        className={cn(
          "group relative h-14 w-full overflow-hidden rounded-2xl",
          "bg-primary text-base font-bold text-primary-foreground",
          "shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.65)]",
          "transition-all duration-300",
          "hover:-translate-y-0.5 hover:bg-primary/95",
          "hover:shadow-[0_16px_40px_-14px_hsl(var(--primary)/0.7)]",
          "active:translate-y-0"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <PiggyBank className="h-5 w-5" />

          Guardar {formatBRL(amount)}

          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>

        <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
      </Button>

      {/* MODAL */}
      {showModal && (
        <div
          className={cn(
            "fixed inset-0 z-[100]",
            "flex items-center justify-center p-4 sm:p-6",
            "bg-black/50 backdrop-blur-md",
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
              "relative w-full max-w-[430px] overflow-hidden",
              "rounded-[32px] border border-border/60",
              "bg-card",
              "shadow-[0_32px_100px_-20px_rgba(0,0,0,0.45)]",
              "animate-in zoom-in-95 slide-in-from-bottom-4",
              "duration-300"
            )}
          >
            {/* Glow superior */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

            {/* BOTÃO FECHAR */}
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label="Fechar"
              className={cn(
                "absolute right-5 top-5 z-20",
                "flex h-9 w-9 items-center justify-center rounded-full",
                "border border-border/60 bg-background/70",
                "text-muted-foreground backdrop-blur-md",
                "transition-all duration-200",
                "hover:scale-105 hover:bg-muted hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 sm:p-7">
              {/* BADGE */}
              <div className="mb-6 flex justify-center">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full",
                    "border border-primary/15 bg-primary/5",
                    "px-3 py-1.5",
                    "text-xs font-bold text-primary"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  DESAFIO DOS 100
                </div>
              </div>

              {/* ÍCONE */}
              <div className="mb-5 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-125 rounded-full bg-primary/10 blur-xl" />

                  <div
                    className={cn(
                      "relative flex h-[88px] w-[88px]",
                      "items-center justify-center rounded-[28px]",
                      "border border-primary/15",
                      "bg-gradient-to-br from-primary/15 to-primary/5",
                      "text-primary",
                      "shadow-sm"
                    )}
                  >
                    <PiggyBank
                      className="h-10 w-10"
                      strokeWidth={1.8}
                    />

                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* TEXTO */}
              <div className="text-center">
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Você vai guardar
                </p>

                <h2
                  id="deposit-modal-title"
                  className="text-4xl font-black tracking-tight text-foreground sm:text-[42px]"
                >
                  {formatBRL(amount)}
                </h2>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                  Confirme o depósito para marcar mais uma etapa da sua
                  jornada como concluída.
                </p>
              </div>

              {/* CARD DO PASSO */}
              <div
                className={cn(
                  "mt-7 rounded-2xl border border-border/60",
                  "bg-muted/30 p-4"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Progresso
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      Passo {stepNumber} de 100
                    </p>
                  </div>

                  <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-black text-primary">
                    {Math.round(progress)}%
                  </div>
                </div>

                {/* Barra */}
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {remainingSteps > 0 ? (
                    <>
                      Depois deste depósito, você estará cada vez mais perto
                      da meta.
                    </>
                  ) : (
                    <>Última etapa do desafio.</>
                  )}
                </p>
              </div>

              {/* INFO SEGURANÇA */}
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-muted/20 px-4 py-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <p className="text-xs leading-5 text-muted-foreground">
                  Confirme apenas depois de realizar o depósito. Essa ação
                  registra esta etapa como concluída.
                </p>
              </div>

              {/* AÇÕES */}
              <div className="mt-6 grid grid-cols-[0.8fr_1.2fr] gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={cn(
                    "h-14 rounded-2xl",
                    "border-border/70",
                    "font-bold",
                    "transition-all",
                    "hover:bg-muted/60"
                  )}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isSubmitting}
                  className={cn(
                    "group h-14 rounded-2xl",
                    "bg-primary font-bold text-primary-foreground",
                    "shadow-[0_10px_30px_-15px_hsl(var(--primary)/0.8)]",
                    "transition-all duration-300",
                    "hover:-translate-y-0.5 hover:bg-primary/95"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Confirmar depósito
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* linha inferior */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}