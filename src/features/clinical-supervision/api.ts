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

const LOOKUP_PAGE_SIZE = 100;
const LOOKUP_MAX_PAGES = 20;

/**
 * Não existe GET /cases/:id no backend: o caso é localizado percorrendo a
 * listagem oficial página a página, sem filtro de status, até encontrá-lo.
 */
export async function findSupervisionCase(caseId: string): Promise<SupervisionCase | null> {
  for (let page = 1; page <= LOOKUP_MAX_PAGES; page += 1) {
    const payload = await listSupervisionCases({ page, limit: LOOKUP_PAGE_SIZE });
    const items = payload.data ?? [];
    const found = items.find((item) => item.id === caseId);
    if (found) return found;
    if (items.length < LOOKUP_PAGE_SIZE) break;
  }
  return null;
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
