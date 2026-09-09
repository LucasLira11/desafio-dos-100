"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ArrowRight, Check, Copy, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isOpen, setIsOpen] = useState(false);
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

  const reset = () => {
    setPhase("select");
    setQuantity(1);
    setCopied(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) reset();
  };

  const handleCopy = async () => {
    if (!pixPayload) return;
    await navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Código PIX copiado!");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const result = await registerDepositAction(steps);
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      steps.length > 1
        ? `${steps.length} passos registrados! ${formatBRL(total)} adicionados.`
        : `${formatBRL(total)} adicionados ao desafio.`
    );
    setIsOpen(false);
    reset();
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-full px-5 gap-1.5 active:scale-95 transition-transform duration-200">
          Depositar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        {phase === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Novo depósito</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Você vai guardar</p>
                <p className="text-4xl font-semibold text-white tracking-tight">{formatBRL(total)}</p>
                <p className="text-xs text-zinc-500">
                  {quantity > 1 ? `Passos ${nextStep} a ${lastStep}` : `Passo ${nextStep}`}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div>
                  <p className="text-sm font-medium text-white">Quantos passos?</p>
                  <p className="text-xs text-zinc-500">Até {maxQuantity} de uma vez</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-white transition-colors hover:bg-zinc-900 disabled:opacity-30"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-white transition-colors hover:bg-zinc-900 disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-2xl"
                onClick={() => setPhase("payment")}
                disabled={!pixKey}
              >
                Gerar pagamento
              </Button>

              {!pixKey && (
                <p className="text-center text-xs text-zinc-500">
                  Configure sua chave PIX em{" "}
                  <a href="/pix" className="text-primary underline underline-offset-2">
                    Conta PIX
                  </a>{" "}
                  antes de gerar o pagamento.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pagar com PIX</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              <div className="flex justify-center">
                <div className="rounded-2xl border border-zinc-800 bg-white p-4">
                  {pixPayload && <QRCodeSVG value={pixPayload} size={176} />}
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-2xl font-semibold text-white tracking-tight">{formatBRL(total)}</p>
                <p className="text-xs text-zinc-500">
                  {quantity > 1 ? `Passos ${nextStep} a ${lastStep}` : `Passo ${nextStep}`}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                className="w-full h-12 rounded-2xl gap-2 border-zinc-800"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Código copiado" : "Copiar PIX Copia e Cola"}
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!copied || isSubmitting}
                className="w-full h-12 rounded-2xl"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar que já paguei"}
              </Button>

              <button
                type="button"
                onClick={() => setPhase("select")}
                className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Voltar
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
