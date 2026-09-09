"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { registerSchema } from "@/features/auth/schema";
import { registerAction } from "@/features/auth/actions";
import { ColorPicker } from "@/features/auth/components/color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", color: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setServerError(null);
    const result = await registerAction(values);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative h-14 w-14">
            <Image src="/icon.png" alt="Desafio dos 100" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground">O primeiro passo da conquista de vocês.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                  {serverError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Como quer ser chamado?</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Ex: Lucas" 
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <ColorPicker
                value={form.watch("color")}
                onChange={(value) => form.setValue("color", value)}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar minha conta"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}