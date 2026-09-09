"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface DepositStep {
  amount: number;
  step_number: number;
}

export async function registerDepositAction(steps: DepositStep[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };
  if (!steps?.length) return { error: "Nenhum passo selecionado." };

  const { data: challenge } = await supabase
    .from("user_challenges")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!challenge) {
    return { error: "Nenhum desafio ativo encontrado." };
  }

  const rows = steps.map((step) => ({
    user_challenge_id: challenge.id,
    step_number: step.step_number,
    amount: step.amount,
  }));

  const { error } = await supabase.from("deposits").insert(rows);

  if (error) {
    console.error("Erro ao depositar:", error);
    if (error.code === '23505') {
      return { error: "Um ou mais desses passos já foram registrados." };
    }
    return { error: "Erro interno ao registrar o depósito." };
  }

  const totalAmount = steps.reduce((sum, step) => sum + step.amount, 0);

  // === INTEGRAÇÃO PUSH NOTIFICATION ===
  try {
    // 1. Descobrir quem é o parceiro (o outro perfil no mesmo grupo)
    const { data: member } = await supabase.from("group_members").select("group_id").eq("profile_id", user.id).single();

    if (member) {
      const { data: partners } = await supabaseAdmin
        .from("group_members")
        .select("profile_id")
        .eq("group_id", member.group_id)
        .neq("profile_id", user.id); // Pega quem NÃO É você logado

      if (partners && partners.length > 0) {
        const partnerId = partners[0].profile_id;

        // 2. Pegar a assinatura de notificação do parceiro
        const { data: subData } = await supabaseAdmin
          .from("push_subscriptions")
          .select("subscription")
          .eq("profile_id", partnerId)
          .single();

        if (subData) {
          // 3. Montar a mensagem e disparar
          const { data: myProfile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
          const firstName = myProfile?.full_name?.split(" ")[0] || "Seu parceiro(a)";
          const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const stepsLabel = steps.length > 1
            ? `${steps.length} passos (#${steps[0].step_number} a #${steps[steps.length - 1].step_number})`
            : `Passo #${steps[0].step_number}`;

          const payload = JSON.stringify({
            title: "Desafio dos 100",
            body: `${firstName} guardou ${formatBRL(totalAmount)} (${stepsLabel}). Falta menos para a meta! 🚀`
          });

          // Disparo assíncrono para não atrasar a tela do usuário
          sendPushNotification(subData.subscription, payload);
        }
      }
    }
  } catch (e) {
    console.error("Erro silencioso no Push:", e);
  }
  // ===================================

  revalidatePath("/", "layout");
  return { success: true };
}

// === FUNÇÃO DE DESFAZER DEPÓSITO RESTAURADA ===
export async function undoDepositAction(depositId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Usuário não autenticado." };

  const { error } = await supabase
    .from("deposits")
    .delete()
    .eq("id", depositId);

  if (error) {
    console.error("Erro ao desfazer depósito:", error);
    return { error: "Não foi possível desfazer este depósito." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}