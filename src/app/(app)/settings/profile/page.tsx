import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { PushButton } from "@/features/settings/components/push-button";
import { AvatarUpload } from "@/features/settings/components/avatar-upload"; // <-- Importando o componente da foto
import { ProfileColorPicker } from "@/features/settings/components/profile-color-picker";
import { InstallAppGuide } from "@/features/settings/components/install-app-guide";
import { getUserColor } from "@/lib/user-color";

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

  // Cor de identificação isolada em query própria: se a coluna "color" ainda
  // não existir no banco (migração pendente), essa busca falha sozinha sem
  // derrubar foto/nome acima.
  const { data: colorProfile } = await supabase
    .from("profiles")
    .select("color")
    .eq("id", user.id)
    .maybeSingle();

  const myColor = getUserColor(colorProfile?.color, 0);

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-10 pb-24">

      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Settings className="h-4 w-4" />
          <span className="font-medium text-xs tracking-widest uppercase">Configurações</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie sua conta e preferências.
        </p>
      </header>

      <section className="space-y-8">

        {/* CARTÃO DE PERFIL COM A FOTO */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">

              <div className="shrink-0">
                {/* Aqui está o botão de trocar a foto! */}
                <AvatarUpload userId={user.id} currentUrl={profile?.avatar_url} ringColor={myColor} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold text-foreground tracking-tight truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* COR DE IDENTIFICAÇÃO */}
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground px-1 uppercase tracking-wider">
            Identidade
          </h3>
          <ProfileColorPicker initialColor={colorProfile?.color || ""} />
        </section>

        {/* NOTIFICAÇÕES */}
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground px-1 uppercase tracking-wider">
            Notificações
          </h3>
          <PushButton />
        </section>

        {/* INSTALAR COMO APP */}
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground px-1 uppercase tracking-wider">
            Aplicativo
          </h3>
          <InstallAppGuide />
        </section>

        {/* BOTÃO DE SAÍDA */}
        <form action={logoutAction} className="pt-4">
          <Button
            variant="outline"
            className="w-full rounded-xl h-14 text-sm font-semibold active:scale-95 transition-transform duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair do Aplicativo
          </Button>
        </form>

      </section>
    </div>
  );
}