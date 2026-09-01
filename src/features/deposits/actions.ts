"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerDepositAction(amount: number, stepNumber: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Usuário não autenticado." };

  const { data: challenge } = await supabase
    .from("user_challenges")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!challenge) {
    return { error: "Nenhum desafio ativo encontrado." };
  }

  const { error } = await supabase
    .from("deposits")
    .insert({
      user_challenge_id: challenge.id,
      step_number: stepNumber,
      amount: amount,
    });

  if (error) {
    console.error("Erro ao depositar:", error);
    if (error.code === '23505') {
      return { error: "Este depósito já foi registrado no banco." };
    }
    return { error: "Erro interno ao registrar o depósito." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// NOVA FUNÇÃO: Desfazer Depósito
export async function undoDepositAction(depositId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Usuário não autenticado." };

  // O RLS (Row Level Security) já configurado no banco garante que este DELETE 
  // só funcionará se o depósito pertencer ao desafio do próprio usuário logado.
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