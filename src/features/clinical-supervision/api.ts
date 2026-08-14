import { apiGet, apiPatch, apiPost } from "@/lib/api";
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

/** A listagem do backend clínico não devolve paginação. */
export function listSupervisionCases(params: SupervisionCasesListParams) {
  return apiGet<{ data: SupervisionCase[] }>(BASE, {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    project_id: params.project_id || undefined,
  });
}

export function createSupervisionCase(input: SupervisionCaseInput) {
  return apiPost<{ data?: SupervisionCase }>(BASE, input);
}

export function updateSupervisionCase(id: string, input: SupervisionCaseUpdate) {
  return apiPatch<{ data?: SupervisionCase }>(`${BASE}/${id}`, input);
}

export function listSupervisionSessions(caseId: string) {
  return apiGet<{ data: SupervisionSession[] }>(`${BASE}/${caseId}/sessions`);
}

export function createSupervisionSession(caseId: string, input: SupervisionSessionInput) {
  return apiPost<{ data?: SupervisionSession }>(`${BASE}/${caseId}/sessions`, input);
}

export function updateSupervisionSession(
  caseId: string,
  sessionId: string,
  input: SupervisionSessionUpdate,
) {
  return apiPatch<{ data?: SupervisionSession }>(`${BASE}/${caseId}/sessions/${sessionId}`, input);
}
