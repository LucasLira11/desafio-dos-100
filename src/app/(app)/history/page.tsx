import { createClient } from "@/lib/supabase/server";
import { HistoryTimeline } from "@/features/history/components/history-timeline";
import { History as HistoryIcon } from "lucide-react";
import { redirect } from "next/navigation";

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
  
  const getFirstName = (memberData: any) => {
    if (!memberData?.profiles) return "Desconhecido";
    const profile = Array.isArray(memberData.profiles) ? memberData.profiles[0] : memberData.profiles;
    return profile?.full_name?.split(" ")[0] || "Desconhecido";
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
      profile_name: getFirstName(ownerData)
    };
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <HistoryIcon className="h-5 w-5" />
          <span className="font-semibold text-sm tracking-widest uppercase">Timeline</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Histórico
        </h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe a jornada de vocês a cada depósito.
        </p>
      </header>

      <section>
        <HistoryTimeline deposits={formattedDeposits} />
      </section>
    </div>
  );
}