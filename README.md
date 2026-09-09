# Desafio dos 100

Pequenos passos. Grandes planos.

PWA financeiro e gamificado onde você (sozinho ou em casal) guarda de R$1 a R$100 por passo, até completar 100 depósitos e formar uma reserva. Construído com Next.js (App Router), Supabase (Auth + PostgreSQL) e Tailwind CSS.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). É necessário um projeto Supabase configurado — veja `.env.local` para as variáveis necessárias e `src/lib/supabase/migrations/` para o schema do banco.

## Stack

- Next.js 16 (App Router, Server Actions)
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS v4
- Web Push (notificações) e PIX Copia e Cola (BR Code/EMV) gerado localmente

## Deploy

Deploy contínuo via Vercel a partir da branch `main`.
