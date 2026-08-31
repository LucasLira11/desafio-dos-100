"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function setupAccountAction(withPartner: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Usuário não autenticado." };

  // Utilizamos o supabaseAdmin para evitar o Paradoxo do RLS 
  // (tentar ler o ID do grupo antes de ser membro dele)
  const { data: existingMember } = await supabaseAdmin
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();

  let groupId = existingMember?.group_id;

  // 1. Se não tem grupo, criamos um novo de forma forçada via Admin
  if (!groupId) {
    const { data: newGroup, error: groupError } = await supabaseAdmin
      .from("groups")
      .insert({})
      .select("id")
      .single();

    if (groupError) {
      console.error("Erro ao criar grupo:", groupError);
      return { error: "Erro ao criar grupo." };
    }
    groupId = newGroup.id;

    // Vincula o usuário ao novo grupo
    await supabaseAdmin.from("group_members").insert({
      group_id: groupId,
      profile_id: user.id,
    });
  }

  // 2. Encontra o ID do "Desafio dos 100" no catálogo
  const { data: challenge } = await supabaseAdmin
    .from("challenges")
    .select("id")
    .eq("name", "Desafio dos 100")
    .single();

  if (challenge) {
    // Inscreve o usuário no desafio (ignoramos erro de duplicidade se ele já estiver inscrito)
    const { error: enrollError } = await supabaseAdmin
      .from("user_challenges")
      .insert({
        profile_id: user.id,
        challenge_id: challenge.id,
        status: "active",
      });
      
    if (enrollError && enrollError.code !== '23505') {
        console.error("Erro ao inscrever no desafio:", enrollError);
    }
  }

  return { success: true };
}

export async function savePreferencesAction(isActive: boolean, time: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Usuário não autenticado." };

  // Atualiza as preferências usando Admin para garantir que será salvo
  const { error } = await supabaseAdmin
    .from("notification_preferences")
    .upsert({
      profile_id: user.id,
      is_active: isActive,
      time_of_day: `${time}:00`,
    }, { onConflict: 'profile_id' });

  if (error) {
    console.error("Erro ao salvar preferências:", error);
    return { error: "Erro ao salvar preferências." };
  }

  redirect("/dashboard");
}