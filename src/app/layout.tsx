import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desafio dos 100",
  description: "Pequenos passos. Grandes planos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary">
        {children}
        {/* Provedor de Notificações Toast Premium */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}