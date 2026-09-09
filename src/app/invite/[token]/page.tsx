import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { acceptInviteAction } from "@/features/couples/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function InvitePage({ params }: { params: any }) {
  // Ajuste seguro de params para compatibilidade entre Next 14 e 15
  const { token } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca dados do convite via Admin Client
  const { data: invite } = await supabaseAdmin
    .from("invites")
    .select("*, groups(group_members(profiles(full_name)))")
    .eq("token", token)
    .eq("used", false)
    .single();

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : true;
  
  // Extração segura do nome de quem convidou
  const inviterName = invite?.groups?.group_members?.[0]?.profiles?.full_name?.split(" ")[0] || "Seu parceiro(a)";

  // Se o usuário clicar no botão e já estiver logado
  const handleAccept = async () => {
    "use server";
    await acceptInviteAction(token);
  };

  if (!invite || isExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-semibold text-foreground">Convite indisponível</h1>
          <p className="text-muted-foreground">Este link de convite já foi utilizado, expirou ou não existe.</p>
          <Button asChild className="mt-4"><Link href="/">Ir para o Início</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Users className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Você recebeu um convite
            </h1>
            <p className="text-muted-foreground px-4">
              <span className="font-semibold text-foreground">{inviterName}</span> convidou você para compartilhar o Desafio dos 100.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {user ? (
              <form action={handleAccept} className="space-y-4 text-center">
                <p className="text-sm text-foreground">
                  Você está logado como <strong>{user.email}</strong>.
                </p>
                <Button type="submit" className="w-full gap-2">
                  Aceitar convite e unir contas
                  <Sparkles className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground pb-2">
                  Você precisa de uma conta para aceitar este convite.
                </p>
                <Button asChild className="w-full gap-2">
                  <Link href="/register">
                    Criar conta
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Já tenho uma conta</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}