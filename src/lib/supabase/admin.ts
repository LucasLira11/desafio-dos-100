import { createClient } from "@supabase/supabase-js";

// ⚠️ ATENÇÃO: Este cliente usa a SERVICE_ROLE_KEY.
// Ele ignora o Row Level Security (RLS) do banco de dados.
// DEVE SER USADO EXCLUSIVAMENTE NO SERVIDOR (Server Actions/Route Handlers).
// Nunca importe este arquivo em Client Components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);