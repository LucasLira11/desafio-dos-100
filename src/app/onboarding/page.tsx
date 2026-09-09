"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, User, Users, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setupAccountAction, savePreferencesAction } from "@/features/onboarding/actions";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [withPartner, setWithPartner] = useState<boolean | null>(null);
  const [remindersActive, setRemindersActive] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep1 = () => setStep(2);

  const handleNextStep2 = async () => {
    if (withPartner === null) return;
    setIsLoading(true);
    
    const result = await setupAccountAction(withPartner);
    setIsLoading(false);
    
    if (result.success) {
      setStep(3);
    } else {
      alert("Ocorreu um erro ao configurar sua conta. Tente novamente.");
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    await savePreferencesAction(remindersActive, reminderTime);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      
      <div className="absolute top-12 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors duration-300",
              step >= i ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 flex flex-col items-center text-center">
            <div className="relative h-24 w-56">
              <Image src="/logo-100.png" alt="Desafio dos 100" fill className="object-contain" priority />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Bem-vindo ao Desafio dos 100
              </h1>
              <p className="text-muted-foreground text-lg px-4">
                O primeiro passo para transformar uma pequena rotina em <span className="font-semibold text-foreground">R$ 10.100,00</span> guardados.
              </p>
            </div>
            <Button onClick={handleNextStep1} size="lg" className="w-full gap-2 mt-4">
              Vamos começar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Como você quer começar?</h2>
              <p className="text-muted-foreground text-sm">
                Você pode convidar alguém depois se mudar de ideia.
              </p>
            </div>

            <div className="space-y-3">
              <Card 
                className={cn(
                  "p-4 cursor-pointer border-2 transition-all hover:border-primary/50",
                  withPartner === false ? "border-primary bg-primary/5" : "border-transparent"
                )}
                onClick={() => setWithPartner(false)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-full text-secondary-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Começar sozinho</h3>
                    <p className="text-sm text-muted-foreground">Vou organizar meu próprio desafio.</p>
                  </div>
                </div>
              </Card>

              <Card 
                className={cn(
                  "p-4 cursor-pointer border-2 transition-all hover:border-primary/50",
                  withPartner === true ? "border-primary bg-primary/5" : "border-transparent"
                )}
                onClick={() => setWithPartner(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Convidar parceiro(a)</h3>
                    <p className="text-sm text-muted-foreground">Faremos o desafio juntos em casal.</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button 
              onClick={handleNextStep2} 
              disabled={withPartner === null || isLoading} 
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="space-y-2 text-center flex flex-col items-center">
              <div className="bg-secondary p-4 rounded-full text-secondary-foreground mb-2">
                <Bell className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Não perca o ritmo</h2>
              {/* CORREÇÃO DO TAILWIND AQUI: max-w-70 em vez de max-w-[280px] */}
              <p className="text-muted-foreground text-sm max-w-70">
                A consistência é o segredo. Quer receber um lembrete para não esquecer do depósito?
              </p>
            </div>

            <Card className="p-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Ativar lembretes</h3>
                  <p className="text-sm text-muted-foreground">Notificações diárias.</p>
                </div>
                <button 
                  onClick={() => setRemindersActive(!remindersActive)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    remindersActive ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    remindersActive ? "left-6" : "left-1"
                  )} />
                </button>
              </div>

              {remindersActive && (
                <div className="flex items-center justify-between animate-in fade-in duration-300 border-t pt-4">
                  <h3 className="font-medium text-foreground">Horário</h3>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-transparent border border-border rounded-md px-3 py-1 text-sm outline-none focus:border-primary text-foreground"
                  />
                </div>
              )}
            </Card>

            <Button onClick={handleFinish} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ir para o Dashboard"}
            </Button>
          </div>
        )}

      </div>
    </main>
  );
}