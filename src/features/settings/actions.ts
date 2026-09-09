"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function revalidateProfileAction() {
  revalidatePath("/settings/profile");
}

export async function updateProfileColorAction(color: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("profiles")
    .update({ color: color || null })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao salvar cor de identificação:", error);
    return { error: "Não foi possível salvar sua cor agora." };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveSubscriptionAction(subscription: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // Remove assinaturas velhas do mesmo usuário para não duplicar
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("profile_id", user.id);

  const { error } = await supabase
    .from("push_subscriptions")
    .insert({
      profile_id: user.id,
      subscription: subscription,
    });

  if (error) {
    console.error("Erro ao salvar assinatura:", error);
    return { error: "Falha ao salvar assinatura de notificações." };
  }

  return { success: true };
}