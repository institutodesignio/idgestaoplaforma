import { apiDownload, apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  PrivacyRequest,
  PrivacyRequestInput,
  PrivacyRequestUpdate,
  RetentionReview,
  RetentionReviewUpdate,
} from "./types";

export type PrivacyRequestsListParams = {
  page: number;
  limit: number;
  status?: string;
  request_type?: string;
};

export function listPrivacyRequests(params: PrivacyRequestsListParams) {
  return apiGet<{ data: PrivacyRequest[] }>("/api/v1/privacy/requests", {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    request_type: params.request_type || undefined,
  });
}

export function createPrivacyRequest(input: PrivacyRequestInput) {
  return apiPost<{ data?: PrivacyRequest }>("/api/v1/privacy/requests", input);
}

export function updatePrivacyRequest(id: string, input: PrivacyRequestUpdate) {
  return apiPatch<{ data?: PrivacyRequest }>(`/api/v1/privacy/requests/${id}`, input);
}

export function listRetentionReviews() {
  return apiGet<{ data: RetentionReview[] }>(
    "/api/v1/privacy/retention-reviews",
  );
}

export function updateRetentionReview(id: string, input: RetentionReviewUpdate) {
  return apiPatch<{ data?: RetentionReview }>(`/api/v1/privacy/retention-reviews/${id}`, input);
}

/** Exportação LGPD: a resposta é um arquivo (Content-Disposition), não um JSON comum. */
export function exportPersonData(personId: string) {
  return apiDownload(`/api/v1/privacy/persons/${personId}/export`, `export-${personId}.json`);
}
