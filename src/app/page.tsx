import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
          <Sparkles className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Desafio dos 100
        </h1>
        <p className="max-w-[400px] text-zinc-500">
          O ambiente de desenvolvimento foi configurado com sucesso. A arquitetura base está pronta.
        </p>
      </div>
    </main>
  );
}