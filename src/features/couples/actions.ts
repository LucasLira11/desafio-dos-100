"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";

export async function generateInviteAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // Usamos o Admin aqui para bypassar a recursividade do RLS na hora de ler o grupo
  const { data: member } = await supabaseAdmin
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();

  if (!member) return { error: "Grupo não encontrado no banco de dados." };

  // Gera um token criptográfico curto, ex: a1b2c3d4
  const token = randomBytes(4).toString("hex");
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Inserimos o convite usando Admin para garantir 100% de sucesso na escrita
  const { error } = await supabaseAdmin.from("invites").insert({
    group_id: member.group_id,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("Erro ao inserir convite:", error);
    return { error: "Erro ao gerar convite" };
  }
  
  return { token };
}

export async function acceptInviteAction(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Bypass RLS para checar o convite
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .single();

  if (inviteError || !invite) return { error: "Convite inválido ou já utilizado." };
  if (new Date(invite.expires_at) < new Date()) return { error: "Este convite expirou." };

  const { data: existingMember } = await supabaseAdmin
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .single();
    
  if (existingMember?.group_id === invite.group_id) {
    return { error: "Você já faz parte deste grupo!" };
  }

  // Remove do grupo antigo (caso o usuário tenha criado um ao fazer Onboarding sozinho)
  if (existingMember) {
    await supabaseAdmin.from("group_members").delete().eq("profile_id", user.id);
  }

  // Insere no novo grupo
  await supabaseAdmin.from("group_members").insert({
    group_id: invite.group_id,
    profile_id: user.id
  });

  // Marca convite como usado
  await supabaseAdmin.from("invites").update({ used: true }).eq("id", invite.id);

  redirect("/dashboard");
}