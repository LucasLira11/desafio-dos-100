"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { saveSubscriptionAction } from "../actions";
import { toast } from "sonner";

// Função nativa para transformar a chave pública em um array de bytes
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
    } else {
      // Checa se já tem permissão
      navigator.serviceWorker.register('/sw.js').then(swReg => {
        swReg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    setIsLoading(true);
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      const res = await saveSubscriptionAction(JSON.parse(JSON.stringify(subscription)));
      
      if (res.error) throw new Error(res.error);

      setIsSubscribed(true);
      toast.success("Notificações ativadas com sucesso!");
    } catch (err: any) {
      if (Notification.permission === 'denied') {
        toast.error("Você bloqueou as notificações no navegador.");
      } else {
        toast.error("Erro ao ativar notificações.");
        console.error(err);
      }
    }
    setIsLoading(false);
  };

  if (!isSupported) return null;

  return (
    <Button 
      variant={isSubscribed ? "secondary" : "default"} 
      onClick={subscribeUser}
      disabled={isSubscribed || isLoading}
      className="w-full gap-2"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      {isSubscribed ? "Notificações Ativas neste aparelho" : "Ativar Notificações no Celular"}
    </Button>
  );
}