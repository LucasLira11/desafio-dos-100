import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { PushButton } from "@/features/settings/components/push-button";
import { AvatarUpload } from "@/features/settings/components/avatar-upload"; // <-- Importando o componente da foto

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // A tabela "profiles" não tem coluna "email" (o e-mail vive em auth.users).
  // Selecionar uma coluna inexistente derrubava a query inteira e fazia
  // full_name e avatar_url caírem sempre no fallback, mesmo com dados salvos.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Settings className="h-5 w-5" />
          <span className="font-semibold text-sm tracking-widest uppercase">Configurações</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie sua conta e preferências.
        </p>
      </header>

      <section className="space-y-8">
        
        {/* CARTÃO DE PERFIL COM A FOTO */}
        <Card className="rounded-3xl shadow-sm border-border bg-card/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">

              <div className="shrink-0">
                {/* Aqui está o botão de trocar a foto! */}
                <AvatarUpload userId={user.id} currentUrl={profile?.avatar_url} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-foreground truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* NOTIFICAÇÕES */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">
            Notificações
          </h3>
          <PushButton />
        </section>

        {/* BOTÃO DE SAÍDA */}
        <form action={logoutAction} className="pt-4">
          <Button
            variant="outline"
            className="w-full rounded-3xl h-14 text-md font-bold shadow-sm hover:-translate-y-1 active:scale-95 transition-all duration-300 text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair do Aplicativo
          </Button>
        </form>
        
      </section>
    </div>
  );
}