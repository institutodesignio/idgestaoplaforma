import { apiGet } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { AuditEvent } from "./types";

export type AuditListParams = { page: number; limit: number; resource_type?: string };

export function listAuditEvents(params: AuditListParams) {
  return apiGet<{ data: AuditEvent[]; pagination?: Pagination }>("/api/v1/audit-events", {
    page: params.page,
    limit: params.limit,
    resource_type: params.resource_type || undefined,
  });
}
