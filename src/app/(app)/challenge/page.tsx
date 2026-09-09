import { createClient } from "@/lib/supabase/server";
import { Target } from "lucide-react";
import { redirect } from "next/navigation";
import { ChallengeGrid } from "@/features/challenge/components/challenge-grid";
import { BadgesShowcase } from "@/features/challenge/components/badges-showcase";
import { getUserColor } from "@/lib/user-color";

export const dynamic = "force-dynamic";

export default async function ChallengePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cor de identificação do usuário (a mesma usada no início e no histórico)
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("color")
    .eq("id", user.id)
    .maybeSingle();

  const myColor = getUserColor(myProfile?.color, 0);

  // 1. Encontra o ID do desafio individual deste usuário logado
  const { data: challenge } = await supabase
    .from("user_challenges")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!challenge) {
    return (
      <div className="p-6 text-center mt-20">
        <p className="text-muted-foreground">Desafio não encontrado.</p>
      </div>
    );
  }

  // 2. Busca apenas os depósitos DESTE usuário
  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount, step_number")
    .eq("user_challenge_id", challenge.id);

  const myDeposits = deposits || [];
  
  // Extrai apenas os números dos passos concluídos para a Grade
  const completedSteps = myDeposits.map(d => d.step_number);
  
  // Soma o total guardado por ele
  const totalSaved = myDeposits.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const depositsCount = myDeposits.length;

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-10">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Target className="h-4 w-4" />
          <span className="font-medium text-xs tracking-widest uppercase">Gamificação</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Meu Desafio
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe seu progresso individual e suas conquistas.
        </p>
      </header>

      {/* Seção 1: Conquistas (Badges) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Mural de Conquistas
        </h2>
        <BadgesShowcase 
          depositsCount={depositsCount} 
          totalSaved={totalSaved} 
        />
      </section>

      {/* Seção 2: Mapa dos 100 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          O Caminho
        </h2>
        <ChallengeGrid completedSteps={completedSteps} color={myColor} />
      </section>

    </div>
  );
}