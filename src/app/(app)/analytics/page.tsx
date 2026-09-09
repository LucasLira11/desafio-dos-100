import { createClient } from "@/lib/supabase/server";
import { ProgressChart } from "@/features/analytics/components/progress-chart";
import { BarChart2, TrendingUp, Calendar, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getChallengeTotal } from "@/features/core/calculations";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Encontra o grupo
  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user!.id)
    .single();

  const groupId = member?.group_id;

  if (!groupId) {
    return (
      <div className="p-6 text-center mt-20">
        <p className="text-muted-foreground">Você ainda não configurou seu grupo.</p>
      </div>
    );
  }

  // 2. Conta os membros para saber se é casal ou solo
  const { count: memberCount } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);

  const isAlone = memberCount === 1;

  // 3. Busca os desafios e os depósitos daquele grupo
  const { data: groupMembers } = await supabase
    .from("group_members")
    .select("profile_id")
    .eq("group_id", groupId);

  const profileIds = groupMembers?.map(m => m.profile_id) || [];

  const { data: challenges } = await supabase
    .from("user_challenges")
    .select("id")
    .in("profile_id", profileIds);

  const challengeIds = challenges?.map(c => c.id) || [];

  // Ordenamos do MAIS ANTIGO para o MAIS RECENTE para o gráfico crescer da esquerda pra direita
  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount, deposited_at")
    .in("user_challenge_id", challengeIds)
    .order("deposited_at", { ascending: true });

  // 4. Lógica de Analytics (Running Total e Projeções)
  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const individualTarget = getChallengeTotal(); // 5050
  const metaCasal = isAlone ? individualTarget : individualTarget * 2;
  const totalDepositsNeeded = isAlone ? 100 : 200;
  
  let runningTotal = 0;
  const chartDataMap = new Map<string, number>();

  // Agrupa depósitos por data e acumula
  deposits?.forEach(d => {
    const date = new Date(d.deposited_at).toLocaleDateString("pt-BR", { 
      timeZone: "America/Sao_Paulo", day: '2-digit', month: '2-digit' 
    });
    runningTotal += Number(d.amount);
    chartDataMap.set(date, runningTotal);
  });

  const chartData = Array.from(chartDataMap.entries()).map(([date, total]) => ({
    date,
    total
  }));

  const totalSaved = runningTotal;
  const depositsCount = deposits?.length || 0;
  
  // ALGORITMO DE PREVISÃO
  let estimatedDateText = "Faça mais depósitos para calcular";
  if (depositsCount >= 2) {
    const firstDepositDate = new Date(deposits![0].deposited_at).getTime();
    const lastDepositDate = new Date(deposits![depositsCount - 1].deposited_at).getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Dias decorridos desde o primeiro depósito
    let daysElapsed = (lastDepositDate - firstDepositDate) / msPerDay;
    if (daysElapsed < 1) daysElapsed = 1; // Evita divisão por zero se fez tudo hoje

    // Velocidade (depósitos por dia)
    const velocity = depositsCount / daysElapsed;
    
    // Quantos dias faltam
    const depositsRemaining = totalDepositsNeeded - depositsCount;
    if (depositsRemaining > 0) {
      const daysRemaining = depositsRemaining / velocity;
      
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(daysRemaining));
      
      estimatedDateText = estimatedDate.toLocaleDateString("pt-BR", {
        month: 'long', year: 'numeric'
      });
      // Deixa a primeira letra maiúscula
      estimatedDateText = estimatedDateText.charAt(0).toUpperCase() + estimatedDateText.slice(1);
    } else {
      estimatedDateText = "Desafio Concluído!";
    }
  }

  // Média por depósito
  const averageDeposit = depositsCount > 0 ? totalSaved / depositsCount : 0;

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-10">
      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <BarChart2 className="h-4 w-4" />
          <span className="font-medium text-xs tracking-widest uppercase">Inteligência</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Análises
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          A matemática por trás das conquistas de vocês.
        </p>
      </header>

      {/* Gráfico */}
      <section>
        <ProgressChart data={chartData} />
      </section>

      {/* Cards de Métricas */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="bg-primary/10 w-fit p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Progresso do Desafio</p>
              <p className="text-xl font-semibold text-foreground tracking-tight">
                {((totalSaved / metaCasal) * 100).toFixed(1).replace('.0', '')}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="bg-primary/10 w-fit p-2 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Média por Depósito</p>
              <p className="text-xl font-semibold text-foreground tracking-tight">{formatBRL(averageDeposit)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 rounded-2xl border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-muted p-3 rounded-full">
              <Calendar className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Previsão de Conclusão</p>
              <p className="text-lg font-semibold text-foreground tracking-tight">{estimatedDateText}</p>
              {depositsCount >= 2 && depositsCount < totalDepositsNeeded && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Baseado no ritmo atual de vocês.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}