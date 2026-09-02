"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePixKeyAction(pixKey: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("profiles")
    .update({ pix_key: pixKey })
    .eq("id", user.id);

  if (error) return { error: "Falha ao salvar a chave PIX." };

  revalidatePath("/pix");
  return { success: true };
}