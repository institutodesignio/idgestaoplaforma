import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type {
  SupervisionCase,
  SupervisionCaseInput,
  SupervisionCaseUpdate,
  SupervisionSession,
  SupervisionSessionInput,
  SupervisionSessionUpdate,
} from "./types";

export type SupervisionCasesListParams = {
  page: number;
  limit: number;
  status?: string;
  project_id?: string;
};

const BASE = "/api/v1/clinical-supervision/cases";

export function listSupervisionCases(params: SupervisionCasesListParams) {
  return apiGet<{ data: SupervisionCase[]; pagination?: Pagination }>(BASE, {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    project_id: params.project_id || undefined,
  });
}

export type SupervisionCaseDetailResponse = {
  case?: SupervisionCase;
  sessions?: SupervisionSession[];
} & Partial<SupervisionCase>;

export function getSupervisionCase(id: string) {
  return apiGet<SupervisionCaseDetailResponse>(`${BASE}/${id}`);
}

export function createSupervisionCase(input: SupervisionCaseInput) {
  return apiPost<{ case?: SupervisionCase }>(BASE, input);
}

export function updateSupervisionCase(id: string, input: SupervisionCaseUpdate) {
  return apiPatch<{ case?: SupervisionCase }>(`${BASE}/${id}`, input);
}

export function listSupervisionSessions(caseId: string) {
  return apiGet<{ data?: SupervisionSession[]; sessions?: SupervisionSession[] }>(
    `${BASE}/${caseId}/sessions`,
  );
}

export function createSupervisionSession(caseId: string, input: SupervisionSessionInput) {
  return apiPost<{ session?: SupervisionSession }>(`${BASE}/${caseId}/sessions`, input);
}

export function updateSupervisionSession(
  caseId: string,
  sessionId: string,
  input: SupervisionSessionUpdate,
) {
  return apiPatch<{ session?: SupervisionSession }>(
    `${BASE}/${caseId}/sessions/${sessionId}`,
    input,
  );
}

export function unwrapSupervisionCase(
  payload: SupervisionCaseDetailResponse | undefined,
): SupervisionCase | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.case) return payload.case;
  return payload.id ? (payload as SupervisionCase) : null;
}
