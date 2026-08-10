import { supabase } from "@/lib/supabase";

/** Backend institucional publicado (fonte de verdade de autorização). */
export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ??
  "https://id-gestao-production.up.railway.app";

export type ApiFailureKind = "unauthenticated" | "expired" | "no_context" | "temporary";

export class ApiError extends Error {
  kind: ApiFailureKind;
  status: number | null;

  constructor(kind: ApiFailureKind, message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Requisição autenticada: o access_token vem SEMPRE da sessão gerenciada
 * pelo SDK oficial do Supabase (nunca de storage próprio).
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new ApiError("temporary", "Falha ao ler a sessão atual.");

  const session = data.session;
  if (!session?.access_token) {
    throw new ApiError("unauthenticated", "Nenhuma sessão ativa.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  } catch {
    throw new ApiError("temporary", "Não foi possível contactar o servidor institucional.");
  }

  if (response.status === 401) {
    throw new ApiError("expired", "Sessão expirada ou inválida.", 401);
  }
  if (response.status === 403 || response.status === 404) {
    throw new ApiError(
      "no_context",
      "Usuário autenticado sem contexto institucional liberado.",
      response.status,
    );
  }
  if (!response.ok) {
    throw new ApiError("temporary", "Erro temporário do servidor institucional.", response.status);
  }

  return (await response.json()) as T;
}
