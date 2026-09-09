"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Target, History, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Início", href: "/dashboard", icon: Home },
  { name: "Meu Desafio", href: "/challenge", icon: Target },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Conta PIX", href: "/pix", icon: Wallet },
  { name: "Perfil", href: "/settings/profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 px-4 py-8">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/icon.png"
              alt="Logo Desafio dos 100"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-lg text-foreground tracking-tight">Desafio dos 100</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  "transition-colors duration-200",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pb-28 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV COM SUPORTE A SAFE AREA */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900 z-50 flex justify-around px-2 py-2 shadow-[0_-1px_0_0_rgba(255,255,255,0.04)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 10px)' }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-16 rounded-xl",
                "transition-colors duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
