"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { savePixKeyAction } from "../actions";
import { toast } from "sonner";
import { Check, Copy, Loader2, Save } from "lucide-react";

export function PixForm({ currentKey }: { currentKey: string }) {
  const [pix, setPix] = useState(currentKey);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const res = await savePixKeyAction(pix);
    if (res.error) toast.error(res.error);
    else toast.success("Chave PIX atualizada com sucesso!");
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (!pix) return;
    navigator.clipboard.writeText(pix);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
      <label className="text-sm font-medium text-foreground">Sua Chave PIX (Para receber)</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={pix}
          onChange={(e) => setPix(e.target.value)}
          placeholder="CPF, E-mail, Celular ou Aleatória"
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-primary text-foreground transition-colors"
        />
        <Button variant="outline" size="icon" onClick={handleCopy} disabled={!pix}>
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <Button onClick={handleSave} disabled={isLoading || pix === currentKey} className="w-full gap-2 text-white">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar Chave
      </Button>
    </div>
  );
}