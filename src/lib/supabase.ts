import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const publishableKey =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined);

/** True quando as credenciais públicas do Supabase existente estão configuradas. */
export const isSupabaseConfigured = Boolean(url && publishableKey);

/**
 * Client público do Supabase (apenas chave publishable/anon).
 * A sessão é administrada pelo SDK oficial — nunca gravamos tokens manualmente.
 */
export const supabase: SupabaseClient = createClient(
  url ?? "https://placeholder.supabase.co",
  publishableKey ?? "public-anon-key-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);