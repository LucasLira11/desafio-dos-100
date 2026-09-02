export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { InviteCard } from "@/features/couples/components/invite-card";
import { ProgressVessel } from "@/features/dashboard/components/progress-vessel";
import { DepositButton } from "@/features/dashboard/components/deposit-button";
import { AvatarUpload } from "@/features/settings/components/avatar-upload"; // <-- Importamos o botão de foto
import { 
  getChallengeTotal, 
  getCompletedAmount, 
  getProgressPercentage, 
  getNextDeposit 
} from "@/features/core/calculations";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user!.id)
    .single();

  const groupId = member?.group_id;

  // AGORA BUSCAMOS O AVATAR_URL TAMBÉM!
  const { data: groupMembers } = await supabase
    .from("group_members")
    .select("profile_id, profiles(full_name, avatar_url)")
    .eq("group_id", groupId);

  const profileIds = groupMembers?.map(m => m.profile_id) || [];
  
  const getFirstName = (memberData: any) => {
    if (!memberData?.profiles) return null;
    const profile = Array.isArray(memberData.profiles) ? memberData.profiles[0] : memberData.profiles;
    return profile?.full_name?.split(" ")[0] || null;
  };

  // Função para extrair a foto
  const getAvatarUrl = (memberData: any) => {
    if (!memberData?.profiles) return null;
    const profile = Array.isArray(memberData.profiles) ? memberData.profiles[0] : memberData.profiles;
    return profile?.avatar_url || null;
  };

  const myProfileData = groupMembers?.find(m => m.profile_id === user!.id);
  const partnerProfileData = groupMembers?.find(m => m.profile_id !== user!.id);
  
  const myName = getFirstName(myProfileData) || "Você";
  const partnerName = getFirstName(partnerProfileData) || null;
  const myAvatar = getAvatarUrl(myProfileData);
  const partnerAvatar = getAvatarUrl(partnerProfileData);
  const isAlone = !partnerName;

  const { data: challenges } = await supabase
    .from("user_challenges")
    .select("id, profile_id")
    .in("profile_id", profileIds);

  const myChallengeId = challenges?.find(c => c.profile_id === user!.id)?.id;
  
  const challengeIds = challenges?.map(c => c.id) || [];
  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount, step_number, user_challenge_id")
    .in("user_challenge_id", challengeIds);

  const myDeposits = deposits?.filter(d => d.user_challenge_id === myChallengeId) || [];
  const partnerDeposits = deposits?.filter(d => d.user_challenge_id !== myChallengeId) || [];

  const individualTarget = getChallengeTotal(); 
  const metaCasal = isAlone ? individualTarget : individualTarget * 2;
  
  const myAmount = getCompletedAmount(myDeposits);
  const partnerAmount = getCompletedAmount(partnerDeposits);
  const valorCasal = myAmount + partnerAmount;
  
  const percentual = getProgressPercentage(valorCasal, metaCasal);
  const myPercentual = getProgressPercentage(myAmount, individualTarget);
  const partnerPercentual = getProgressPercentage(partnerAmount, individualTarget);

  const myCompletedSteps = myDeposits.map(d => d.step_number);
  
  const myNextStep = getNextDeposit(myCompletedSteps); 
  const myNextAmount = myNextStep; 

  const hour = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "numeric" });
  const hourNum = parseInt(hour);
  let greeting = "Boa noite";
  if (hourNum >= 5 && hourNum < 12) greeting = "Bom dia";
  else if (hourNum >= 12 && hourNum < 18) greeting = "Boa tarde";

  const formatBRL = (val: number) => (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER COM BOTÃO PARA SUBIR A SUA FOTO */}
      <header className="flex justify-between items-center space-y-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {greeting}, {myName} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Vocês estão cada vez mais perto da meta.
          </p>
        </div>
        {/* Você pode clicar aqui para trocar a sua foto! */}
        <div className="shrink-0">
           <AvatarUpload userId={user!.id} currentUrl={myAvatar} />
        </div>
      </header>

      {/* A CÁPSULA DO ROUND 6 */}
      <section className="space-y-2">
        <div className="flex justify-between items-end px-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nosso desafio</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-bold text-foreground">R$ {formatBRL(valorCasal)}</h2>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                de R$ {formatBRL(metaCasal)}
              </span>
            </div>
          </div>
        </div>

        <ProgressVessel 
          percentage={percentual}
          totalSaved={valorCasal}
          totalTarget={metaCasal}
        />
      </section>

      {/* PRÓXIMO DEPÓSITO */}
      <section>
        {myNextStep !== null ? (
          <Card className="border-border overflow-hidden shadow-sm rounded-3xl">
            <CardContent className="p-0 flex items-center">
              <div className="p-5 flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Seu próximo passo</p>
                <p className="text-2xl font-bold text-foreground">R$ {formatBRL(myNextAmount!)}</p>
              </div>
              <div className="p-5 bg-muted/30">
                <DepositButton amount={myNextAmount!} stepNumber={myNextStep} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30 bg-primary/5 overflow-hidden shadow-sm rounded-3xl">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="bg-primary/20 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Você concluiu seus 100 depósitos!</p>
                <p className="text-sm text-muted-foreground">Sua parte do desafio está completa. 🎉</p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CAIXINHAS INDIVIDUAIS COM FOTOS (O CLÁSSICO VOLTOU!) */}
      <section className="grid grid-cols-2 gap-4 pb-10">
        <Card className="shadow-sm rounded-3xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {myAvatar ? (
                <img src={myAvatar} alt={myName} className="w-8 h-8 rounded-full object-cover border border-primary/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {myName[0]}
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground">{myName}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-xl font-bold text-foreground">{myPercentual.toFixed(1).replace('.0', '')}%</p>
              <p className="text-xs text-muted-foreground">R$ {formatBRL(myAmount)}</p>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${myPercentual}%` }} />
            </div>
          </CardContent>
        </Card>
        
        {isAlone ? (
          <div className="col-span-2 mt-2">
            <InviteCard />
          </div>
        ) : (
          <Card className="shadow-sm rounded-3xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="w-8 h-8 rounded-full object-cover border border-primary/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {partnerName![0]}
                  </div>
                )}
                <p className="text-sm font-medium text-muted-foreground">{partnerName}</p>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-bold text-foreground">{partnerPercentual.toFixed(1).replace('.0', '')}%</p>
                <p className="text-xs text-muted-foreground">R$ {formatBRL(partnerAmount)}</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${partnerPercentual}%` }} />
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}