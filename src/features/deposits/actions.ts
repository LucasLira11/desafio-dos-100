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

  // Avisa o Next.js para limpar o cache de forma mais abrangente
  revalidatePath("/dashboard");
  revalidatePath("/");
  
  return { success: true };
}