import { apiFetch } from "@/lib/api";

export type InstitutionalUser = {
  id?: string;
  email?: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
};

export type NamedEntity = { id?: string; name?: string; [key: string]: unknown };

export type InstitutionalContext = {
  user: InstitutionalUser | null;
  organization: NamedEntity | null;
  membership: NamedEntity | null;
  roles: string[];
  permissions: string[];
  scopes: string[];
  raw: unknown;
};

/** A API pode devolver strings ou objetos ({ code | slug | name }). Normalizamos. */
function toCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const code = record["code"] ?? record["slug"] ?? record["permission"] ?? record["name"];
        if (typeof code === "string") return code;
      }
      return null;
    })
    .filter((code): code is string => Boolean(code));
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeMe(payload: unknown): InstitutionalContext {
  const root = asObject(payload) ?? {};
  const body = asObject(root["data"]) ?? root;

  return {
    user: asObject(body["user"]) as InstitutionalUser | null,
    organization: (asObject(body["organization"]) ?? asObject(body["org"])) as NamedEntity | null,
    membership: asObject(body["membership"]) as NamedEntity | null,
    roles: toCodes(body["roles"]),
    permissions: toCodes(body["permissions"]),
    scopes: toCodes(body["scopes"]),
    raw: payload,
  };
}

/** GET /api/v1/me — contexto institucional autoritativo. */
export async function fetchInstitutionalContext(): Promise<InstitutionalContext> {
  const payload = await apiFetch<unknown>("/api/v1/me");
  return normalizeMe(payload);
}
