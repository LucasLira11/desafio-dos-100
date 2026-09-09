"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "./schema";
import { z } from "zod";
import { redirect } from "next/navigation";

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { error: "Credenciais inválidas. Verifique seu e-mail e senha." };
  }

  redirect("/onboarding");
}

export async function registerAction(values: z.infer<typeof registerSchema>) {
  const supabase = await createClient();

  // 1. Cria o usuário na tabela interna do Supabase (auth.users)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // 2. Insere os dados públicos na nossa tabela profiles
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: values.name,
      color: values.color || null,
    });

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError);
      return { error: "Conta criada, mas houve um erro ao configurar o nome." };
    }
  }

  redirect("/onboarding");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}