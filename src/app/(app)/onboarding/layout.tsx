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

  // Verifica no banco se o usuário já está em um grupo
  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();

  // Se já tem grupo (já escolheu sozinho ou casal), chuta pro dashboard
  if (member?.group_id) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}