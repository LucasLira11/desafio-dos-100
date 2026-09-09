"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Minus,
  PiggyBank,
  Plus,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerDepositAction } from "@/features/deposits/actions";
import { generatePixPayload } from "@/lib/pix";

interface DepositFormProps {
  nextStep: number;
  maxQuantity: number;
  pixKey: string | null;
  recipientName: string;
  city?: string;
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function DepositForm({ nextStep, maxQuantity, pixKey, recipientName, city = "SAO PAULO" }: DepositFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [phase, setPhase] = useState<"select" | "payment">("select");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Passos escolhidos: [nextStep, nextStep + 1, ..., nextStep + quantity - 1]
  const steps = useMemo(
    () => Array.from({ length: quantity }, (_, i) => {
      const step_number = nextStep + i;
      return { step_number, amount: step_number };
    }),
    [nextStep, quantity]
  );

  const total = steps.reduce((sum, step) => sum + step.amount, 0);
  const lastStep = nextStep + quantity - 1;
  const stepsLabel = quantity > 1 ? `Passos ${nextStep} a ${lastStep}` : `Passo ${nextStep}`;

  const pixPayload = useMemo(() => {
    if (!pixKey) return null;
    return generatePixPayload({
      key: pixKey,
      name: recipientName,
      city,
      amount: total,
      txId: `DESAFIO${nextStep}`,
    });
  }, [pixKey, recipientName, city, total, nextStep]);

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  // Reseta o formulário só depois que a animação de saída termina
  useEffect(() => {
    if (showModal) return;
    const timeout = setTimeout(() => {
      setPhase("select");
      setQuantity(1);
      setCopied(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [showModal]);

  // Trava o scroll e o ESC
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [showModal, isSubmitting]);

  const handleCopy = async () => {
    if (!pixPayload) return;
    await navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Código PIX copiado!");
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const result = await registerDepositAction(steps);

      if (result?.success) {
        toast.success(
          steps.length > 1 ? "Depósitos registrados!" : "Depósito registrado!",
          { description: `${formatBRL(total)} adicionados ao desafio.` }
        );
        setShowModal(false);
        router.refresh();
      } else {
        toast.error("Erro", { description: result?.error || "Erro ao registrar." });
      }
    } catch (error) {
      toast.error("Erro", { description: "Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* BOTÃO PRINCIPAL */}
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        className="h-12 w-full sm:w-auto rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Depositar <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* MODAL SÓLIDO (SEM TRANSPARÊNCIA) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200">

          {/* CAIXA DO MODAL (Totalmente opaca) */}
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090b] shadow-2xl animate-in zoom-in-95 duration-200">

            {/* BOTÃO FECHAR */}
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              {phase === "select" ? (
                <>
                  {/* ÍCONE */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-primary">
                      <PiggyBank className="h-7 w-7" strokeWidth={2} />
                    </div>
                  </div>

                  {/* TEXTOS */}
                  <div className="text-center mb-6">
                    <p className="mb-1 text-sm font-medium text-zinc-500 uppercase tracking-widest">
                      Você vai guardar
                    </p>
                    <h2 className="text-4xl font-semibold tracking-tight text-white mb-2">
                      {formatBRL(total)}
                    </h2>
                    <p className="text-sm text-zinc-400">{stepsLabel}</p>
                  </div>

                  {/* SELETOR DE QUANTIDADE DE PASSOS */}
                  <div className="mb-6 flex items-center justify-between rounded-xl bg-zinc-900 p-4 border border-zinc-800/50">
                    <div>
                      <p className="text-sm font-medium text-white">Quantos passos?</p>
                      <p className="text-xs text-zinc-500">Até {maxQuantity} de uma vez</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-lg font-semibold text-white tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                        disabled={quantity >= maxQuantity}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!pixKey ? (
                    <p className="text-center text-xs text-zinc-500">
                      Configure sua chave PIX em{" "}
                      <a href="/pix" className="text-primary underline underline-offset-2">
                        Conta PIX
                      </a>{" "}
                      antes de gerar o pagamento.
                    </p>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setPhase("payment")}
                      className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Gerar pagamento
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {/* ÍCONE */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-primary">
                      <QrCode className="h-7 w-7" strokeWidth={2} />
                      {copied && (
                        <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#09090b] bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TEXTOS */}
                  <div className="text-center mb-6">
                    <p className="mb-1 text-sm font-medium text-zinc-500 uppercase tracking-widest">
                      Pagar com PIX
                    </p>
                    <h2 className="text-4xl font-semibold tracking-tight text-white mb-2">
                      {formatBRL(total)}
                    </h2>
                    <p className="text-sm text-zinc-400">{stepsLabel}</p>
                  </div>

                  {/* QR CODE */}
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-2xl border border-zinc-800 bg-white p-4">
                      {pixPayload && <QRCodeSVG value={pixPayload} size={168} />}
                    </div>
                  </div>

                  {/* AVISO DE SEGURANÇA */}
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-zinc-900 p-4 border border-zinc-800/50">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs leading-5 text-zinc-400">
                      Copie o código e pague no app do seu banco. Só confirme depois que o PIX for concluído.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCopy}
                    variant="outline"
                    className="mb-3 h-12 w-full rounded-xl border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white gap-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Código copiado" : "Copiar PIX Copia e Cola"}
                  </Button>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPhase("select")}
                      disabled={isSubmitting}
                      className="h-12 rounded-xl border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!copied || isSubmitting}
                      className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Já paguei"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
