import { AppShell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import "@/app/globals.css"; // <-- CORRIGIDO AQUI COM O ALIAS ABSOLUTO

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <AppShell>{children}</AppShell>;
}