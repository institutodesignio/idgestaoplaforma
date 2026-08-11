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

export function listUnits(params: UnitsListParams) {
  return apiGet<UnitsListResponse>("/api/v1/units", {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: params.status || undefined,
  });
}

export function getUnit(id: string) {
  return apiGet<{ unit?: Unit } | Unit>(`/api/v1/units/${id}`);
}

export function createUnit(input: UnitInput) {
  return apiPost<{ unit?: Unit } | Unit>("/api/v1/units", input);
}

export function updateUnit(id: string, input: Partial<UnitInput>) {
  return apiPatch<{ unit?: Unit } | Unit>(`/api/v1/units/${id}`, input);
}

/** Exclusão lógica (soft delete) executada pelo backend. */
export function deleteUnit(id: string) {
  return apiDelete<void>(`/api/v1/units/${id}`);
}

export function unwrapUnit(payload: { unit?: Unit } | Unit | undefined): Unit | null {
  if (!payload || typeof payload !== "object") return null;
  if ("unit" in payload && payload.unit) return payload.unit;
  return "id" in payload ? (payload as Unit) : null;
}