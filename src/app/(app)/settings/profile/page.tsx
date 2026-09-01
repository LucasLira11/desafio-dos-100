import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Settings, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { ThemeSwitcher } from "@/features/settings/components/theme-switcher";
import { PushButton } from "@/features/settings/components/push-button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: notificationPrefs } = await supabase
    .from("notification_preferences")
    .select("is_active, time_of_day")
    .eq("profile_id", user.id)
    .single();

  const fullName = profile?.full_name || "Viajante";
  const email = user.email || "";
  
  // Extrai as iniciais para a foto (Ex: Lucas Pontes -> LP)
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return "Não configurado";
    return timeString.substring(0, 5); // "20:00:00" -> "20:00"
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Settings className="h-5 w-5" />
          <span className="font-semibold text-sm tracking-widest uppercase">Ajustes</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie sua conta e preferências do aplicativo.
        </p>
      </header>

      {/* Cartão de Perfil */}
      <section>
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
              {getInitials(fullName)}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Preferências Visuais */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Aparência
        </h2>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <ThemeSwitcher />
          </CardContent>
        </Card>
      </section>

      {/* Preferências de Notificação (Push + Alerta) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Lembretes & Alertas
        </h2>
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full text-foreground">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Lembrete Diário</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationPrefs?.is_active 
                      ? `Marcado para ${formatTime(notificationPrefs?.time_of_day)}` 
                      : "Desativado"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
               <PushButton />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Zona de Perigo (Logout) */}
      <section className="pt-6 border-t border-border">
        <form action={logoutAction}>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 rounded-xl h-12 shadow-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </form>
      </section>
    </div>
  );
}