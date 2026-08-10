import { supabase } from "@/lib/supabase";

/** Backend institucional publicado (fonte de verdade de autorização). */
export const API_BASE_URL = (
  (import.meta.env["VITE_ID_GESTAO_API_URL"] as string | undefined) ??
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ??
  "https://id-gestao-production.up.railway.app"
).replace(/\/+$/, "");

export type ApiFailureKind =
  | "unauthenticated"
  | "expired"
  | "no_context"
  | "forbidden"
  | "not_found"
  | "validation"
  | "temporary";

export class ApiError extends Error {
  kind: ApiFailureKind;
  status: number | null;
  /** Erros de validação por campo devolvidos pela API (400). */
  fieldErrors: Record<string, string>;

  constructor(
    kind: ApiFailureKind,
    message: string,
    status: number | null = null,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type QueryValue = string | number | boolean | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** Extrai mensagem amigável + erros por campo, sem expor detalhes internos do banco. */
function parseErrorBody(body: unknown): {
  message: string | null;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  let message: string | null = null;

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const raw = record["message"] ?? record["error"] ?? record["detail"];
    if (
      typeof raw === "string" &&
      raw.length < 200 &&
      !/(relation|column|constraint|pg_|sql)/i.test(raw)
    ) {
      message = raw;
    }

    const issues = record["errors"] ?? record["issues"] ?? record["details"];
    if (Array.isArray(issues)) {
      for (const issue of issues) {
        if (!issue || typeof issue !== "object") continue;
        const item = issue as Record<string, unknown>;
        const pathValue = item["path"] ?? item["field"] ?? item["param"];
        const field = Array.isArray(pathValue)
          ? pathValue.map(String).join(".")
          : typeof pathValue === "string"
            ? pathValue
            : null;
        const detail = item["message"];
        if (field && typeof detail === "string") fieldErrors[field] = detail;
      }
    } else if (issues && typeof issues === "object") {
      for (const [field, detail] of Object.entries(issues as Record<string, unknown>)) {
        if (typeof detail === "string") fieldErrors[field] = detail;
        else if (Array.isArray(detail) && typeof detail[0] === "string")
          fieldErrors[field] = detail[0];
      }
    }
  }

  return { message, fieldErrors };
}

/**
 * Requisição autenticada: o access_token vem SEMPRE da sessão gerenciada
 * pelo SDK oficial do Supabase (nunca de storage próprio).
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { query?: Record<string, QueryValue> } = {},
): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new ApiError("temporary", "Falha ao ler a sessão atual.");

  const session = data.session;
  if (!session?.access_token) {
    throw new ApiError("unauthenticated", "Nenhuma sessão ativa.");
  }

  const { query, ...requestInit } = init;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...requestInit,
      headers: {
        Accept: "application/json",
        ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
        ...(requestInit.headers ?? {}),
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  } catch {
    throw new ApiError("temporary", "Não foi possível contactar o servidor institucional.");
  }

  if (response.status === 401) {
    throw new ApiError("expired", "Sessão expirada ou inválida.", 401);
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const { message, fieldErrors } = parseErrorBody(body);

    if (response.status === 400 || response.status === 422) {
      throw new ApiError(
        "validation",
        message ?? "Alguns dados enviados não são válidos. Revise os campos destacados.",
        response.status,
        fieldErrors,
      );
    }
    if (response.status === 403) {
      throw new ApiError(
        "forbidden",
        message ?? "Você não possui permissão para esta operação.",
        403,
      );
    }
    if (response.status === 404) {
      throw new ApiError("not_found", message ?? "Registro não encontrado.", 404);
    }
    throw new ApiError("temporary", "Erro temporário do servidor institucional.", response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string, query?: Record<string, QueryValue>) {
  return apiFetch<T>(path, query ? { method: "GET", query } : { method: "GET" });
}

export function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

/** Mensagem amigável para qualquer falha de API. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case "unauthenticated":
      case "expired":
        return "Sua sessão expirou. Entre novamente para continuar.";
      case "forbidden":
      case "no_context":
        return "Você não possui permissão para esta operação.";
      case "not_found":
        return "Registro não encontrado.";
      case "validation":
        return error.message;
      default:
        return "O servidor institucional está indisponível. Tente novamente em instantes.";
    }
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}
