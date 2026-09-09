import { createClient } from "@/lib/supabase/server";
import { HistoryTimeline } from "@/features/history/components/history-timeline";
import { History as HistoryIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getUserColor } from "@/lib/user-color";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Encontra o grupo do usuário
  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();

  const groupId = member?.group_id;

  if (!groupId) {
    return (
      <div className="p-6 text-center mt-20">
        <p className="text-muted-foreground">Você ainda não configurou seu grupo.</p>
      </div>
    );
  }

  // 2. Busca membros do grupo para associar os nomes
  const { data: groupMembers } = await supabase
    .from("group_members")
    .select("profile_id, profiles(full_name)")
    .eq("group_id", groupId);

  const profileIds = groupMembers?.map(m => m.profile_id) || [];

  const getMemberProfile = (memberData: any) => {
    if (!memberData?.profiles) return null;
    return Array.isArray(memberData.profiles) ? memberData.profiles[0] : memberData.profiles;
  };

  const getFirstName = (memberData: any) => {
    return getMemberProfile(memberData)?.full_name?.split(" ")[0] || "Desconhecido";
  };

  // Busca a cor de identificação separadamente: se a coluna "color" ainda não
  // existir no banco (migração pendente), essa query falha isolada sem
  // derrubar nomes/depósitos acima, e cai no padrão verde/roxo.
  const { data: colorRows } = await supabase
    .from("profiles")
    .select("id, color")
    .in("id", profileIds);

  const colorMap = new Map((colorRows || []).map((r: any) => [r.id, r.color]));

  // A pessoa logada é sempre o índice 0 (padrão verde); a outra é o índice 1 (padrão roxo)
  const getOwnerColor = (ownerProfileId: string | undefined) => {
    const colorIndex = ownerProfileId === user.id ? 0 : 1;
    return getUserColor(ownerProfileId ? colorMap.get(ownerProfileId) : null, colorIndex);
  };

  // 3. Pega os IDs dos desafios ativos daquele grupo
  const { data: challenges } = await supabase
    .from("user_challenges")
    .select("id, profile_id")
    .in("profile_id", profileIds);

  const challengeIds = challenges?.map(c => c.id) || [];
  const myChallengeId = challenges?.find(c => c.profile_id === user.id)?.id;

  // 4. Busca todos os depósitos ordenados do mais recente para o mais antigo
  const { data: depositsData } = await supabase
    .from("deposits")
    .select("id, amount, step_number, deposited_at, user_challenge_id")
    .in("user_challenge_id", challengeIds)
    .order("deposited_at", { ascending: false });

  // 5. Formata os dados para o componente visual da Timeline
  const formattedDeposits = (depositsData || []).map(deposit => {
    const isMine = deposit.user_challenge_id === myChallengeId;
    const challengeOwnerId = challenges?.find(c => c.id === deposit.user_challenge_id)?.profile_id;
    const ownerData = groupMembers?.find(m => m.profile_id === challengeOwnerId);
    
    return {
      id: deposit.id,
      amount: Number(deposit.amount),
      step_number: deposit.step_number,
      deposited_at: deposit.deposited_at,
      is_mine: isMine,
      profile_name: getFirstName(ownerData),
      profile_color: getOwnerColor(challengeOwnerId)
    };
  });

  const totalDeposited = formattedDeposits.reduce((sum, d) => sum + d.amount, 0);
  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-10 pb-24">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <HistoryIcon className="h-4 w-4" />
          <span className="font-medium text-xs tracking-widest uppercase">Timeline</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Histórico
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe a jornada de vocês a cada depósito.
        </p>
      </header>

      {formattedDeposits.length > 0 && (
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total guardado</p>
            <p className="text-xl font-semibold text-foreground tracking-tight mt-1 truncate">{formatBRL(totalDeposited)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Depósitos feitos</p>
            <p className="text-xl font-semibold text-foreground tracking-tight mt-1">{formattedDeposits.length}</p>
          </div>
        </section>
      )}

      <section>
        <HistoryTimeline deposits={formattedDeposits} />
      </section>
    </div>
  );
}