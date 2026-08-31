import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Desafio dos 100
          </h1>
          <p className="text-muted-foreground">
            R$ 1 de cada vez. Uma conquista de vocês dois.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Visão Geral do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Participantes</span>
              <span className="font-medium">Lucas e Julia</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Meta Conjunta</span>
              <span className="font-medium text-primary">R$ 10.100,00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Depósitos</span>
              <span className="font-medium">100 etapas cada</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button className="w-full gap-2">
            Começar nosso desafio
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full">
            Ver como funciona
          </Button>
        </div>
      </div>
    </main>
  );
}