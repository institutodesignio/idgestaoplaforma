import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { Unit, UnitInput } from "./types";

export type UnitsListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

export type UnitsListResponse = { data: Unit[]; pagination?: Pagination };

export type UnitDetailResponse = {
  data?: Unit;
  unit?: Unit;
} & Partial<Unit>;

export function listUnits(params: UnitsListParams) {
  return apiGet<UnitsListResponse>("/api/v1/units", {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: params.status || undefined,
  });
}

export function getUnit(id: string) {
  return apiGet<UnitDetailResponse>(`/api/v1/units/${id}`);
}

export function createUnit(input: UnitInput) {
  return apiPost<UnitDetailResponse>("/api/v1/units", input);
}

export function updateUnit(id: string, input: Partial<UnitInput>) {
  return apiPatch<UnitDetailResponse>(`/api/v1/units/${id}`, input);
}

/** Exclusão lógica (soft delete) executada pelo backend. */
export function deleteUnit(id: string) {
  return apiDelete<void>(`/api/v1/units/${id}`);
}

/** Aceita os envelopes oficiais `{ data }`, `{ unit }` ou o objeto direto. */
export function unwrapUnit(payload: UnitDetailResponse | undefined): Unit | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.data && typeof payload.data === "object" && payload.data.id) return payload.data;
  if (payload.unit) return payload.unit;
  return payload.id ? (payload as Unit) : null;
}
