"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Target, History, Wallet, User } from "lucide-react"; // Removemos BarChart2, adicionamos Wallet
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Início", href: "/dashboard", icon: Home },
  { name: "Meu Desafio", href: "/challenge", icon: Target },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Conta PIX", href: "/pix", icon: Wallet }, // <-- NOVA OPÇÃO DO PIX AQUI
  { name: "Perfil", href: "/settings/profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          {/* SEU LOGO AQUI NA SIDEBAR */}
          <div className="relative h-8 w-8 shrink-0">
            <Image 
              src="/icon.png" 
              alt="Logo Desafio dos 100" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Desafio dos 100</span>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pb-28 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV COM SUPORTE A SAFE AREA */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md z-50 flex justify-around p-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-16 transition-colors rounded-xl",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
              <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}