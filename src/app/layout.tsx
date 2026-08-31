import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900 min-h-screen selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}