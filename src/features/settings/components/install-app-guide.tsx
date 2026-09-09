"use client";

import { useEffect, useState } from "react";
import { Download, MoreVertical, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Platform = "android" | "ios";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
        {number}
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed">{children}</span>
    </li>
  );
}

export function InstallAppGuide() {
  const [platform, setPlatform] = useState<Platform>("android");
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      setPlatform("ios");
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
    };
    const handleInstalled = () => setIsInstalled(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Instalar como aplicativo</p>
          <p className="text-xs text-muted-foreground">
            Acesso direto pela tela inicial, sem precisar abrir o navegador.
          </p>
        </div>
      </div>

      {isInstalled ? (
        <p className="text-sm text-muted-foreground">
          Você já está usando o Desafio dos 100 instalado como aplicativo. 🎉
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setPlatform("android")}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                platform === "android" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Android
            </button>
            <button
              type="button"
              onClick={() => setPlatform("ios")}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                platform === "ios" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              iPhone (iOS)
            </button>
          </div>

          {platform === "android" ? (
            deferredPrompt ? (
              <Button onClick={handleInstallClick} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Instalar agora
              </Button>
            ) : (
              <ol className="space-y-3">
                <Step number={1}>
                  Toque no menu <MoreVertical className="inline h-4 w-4 -mt-0.5 text-foreground" /> no canto
                  superior direito do Chrome.
                </Step>
                <Step number={2}>
                  Toque em <strong className="text-foreground">"Instalar aplicativo"</strong> ou{" "}
                  <strong className="text-foreground">"Adicionar à tela inicial"</strong>.
                </Step>
                <Step number={3}>
                  Confirme tocando em <strong className="text-foreground">"Instalar"</strong>.
                </Step>
              </ol>
            )
          ) : (
            <ol className="space-y-3">
              <Step number={1}>
                Abra o Desafio dos 100 no <strong className="text-foreground">Safari</strong> — esse recurso não
                funciona em outros navegadores no iPhone.
              </Step>
              <Step number={2}>
                Toque no ícone de compartilhar <Share className="inline h-4 w-4 -mt-0.5 text-foreground" /> na
                barra inferior.
              </Step>
              <Step number={3}>
                Toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong>.
              </Step>
              <Step number={4}>
                Confirme tocando em <strong className="text-foreground">"Adicionar"</strong>.
              </Step>
            </ol>
          )}
        </>
      )}
    </div>
  );
}
