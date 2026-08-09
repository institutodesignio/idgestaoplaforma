import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Configuração PÚBLICA do projeto Supabase institucional já existente.
 * Apenas URL + chave anon/publishable (seguras no frontend).
 * NUNCA adicionar service_role aqui.
 */
const SUPABASE_URL =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ??
  "https://bbvqqwcpgrgdnhasliwh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidnFxd2NwZ3JnZG5oYXNsaXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjI0NjgsImV4cCI6MjA5NjUzODQ2OH0.UkKajMUrQl-uELMkLyUuI6ceJs4H2JLFse7RP0LMCs4";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Client público do Supabase (apenas chave publishable/anon).
 * A sessão é administrada pelo SDK oficial — nunca gravamos tokens manualmente.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
});