import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Wallet, QrCode } from "lucide-react";
import { PixForm } from "@/features/pix/components/pix-form";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pega a chave do usuário logado
  const { data: profile } = await supabase
    .from("profiles")
    .select("pix_key, full_name")
    .eq("id", user.id)
    .single();

  // Busca se o parceiro(a) deixou uma chave salva
  let partnerProfile = null;
  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();

  if (member) {
    const { data: partners } = await supabaseAdmin
      .from("group_members")
      .select("profile_id")
      .eq("group_id", member.group_id)
      .neq("profile_id", user.id);

    if (partners && partners.length > 0) {
      const { data: pData } = await supabaseAdmin
        .from("profiles")
        .select("pix_key, full_name")
        .eq("id", partners[0].profile_id)
        .single();
      partnerProfile = pData;
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Wallet className="h-5 w-5" />
          <span className="font-semibold text-sm tracking-widest uppercase">Pagamentos</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Conta PIX
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure a chave PIX oficial para os depósitos do desafio.
        </p>
      </header>

      <section className="space-y-6">
        <PixForm currentKey={profile?.pix_key || ""} />

        {partnerProfile?.pix_key && (
           <div className="p-5 border border-border rounded-2xl bg-primary/5 space-y-3">
             <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
               Chave de {partnerProfile.full_name?.split(" ")[0]}
             </p>
             <div className="flex items-center gap-3 bg-background p-4 rounded-xl border border-border">
               <QrCode className="h-6 w-6 text-primary shrink-0" />
               <code className="text-lg font-bold text-foreground break-all">
                 {partnerProfile.pix_key}
               </code>
             </div>
             <p className="text-xs text-muted-foreground">
               Dica: Se vocês usam a conta de um só, apenas copie a chave acima quando for depositar.
             </p>
           </div>
        )}
      </section>
    </div>
  );
}