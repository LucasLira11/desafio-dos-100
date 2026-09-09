import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica no banco se o usuário já concluiu o setup (já está em um grupo).
  // maybeSingle() evita erro/log quando o usuário ainda não tem grupo (novo cadastro).
  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  // Se já tem grupo, o onboarding já foi concluído antes: pula direto pro dashboard.
  if (member?.group_id) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
