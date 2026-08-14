import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { CareRequest, CareRequestInput, CareRequestUpdate } from "./types";

export type CareRequestsListParams = {
  page: number;
  limit: number;
  status?: string;
  person_id?: string;
  priority?: string;
};

export type CareRequestsListResponse = { data: CareRequest[]; pagination?: Pagination };

export function listCareRequests(params: CareRequestsListParams) {
  return apiGet<CareRequestsListResponse>("/api/v1/care-requests", {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    person_id: params.person_id || undefined,
    priority: params.priority || undefined,
  });
}

export function createCareRequest(input: CareRequestInput) {
  return apiPost<{ care_request?: CareRequest }>("/api/v1/care-requests", input);
}

export function updateCareRequest(id: string, input: CareRequestUpdate) {
  return apiPatch<{ care_request?: CareRequest }>(`/api/v1/care-requests/${id}`, input);
}