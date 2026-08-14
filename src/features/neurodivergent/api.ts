import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { IntakeSubmitInput, NeurodivergentIntake } from "./types";

export type IntakesListParams = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
};

const BASE = "/api/v1/neurodivergent-intakes";

export function listIntakes(params: IntakesListParams) {
  return apiGet<{ data: NeurodivergentIntake[] }>(BASE, {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    search: params.search || undefined,
  });
}

export function getIntake(id: string) {
  return apiGet<{ data?: NeurodivergentIntake }>(`${BASE}/${id}`);
}

export function submitIntake(input: IntakeSubmitInput) {
  return apiPost<{ data?: NeurodivergentIntake & { protocol?: string | null } }>(
    `${BASE}/submit`,
    input,
  );
}

export function revokeIntakeConsent(intakeId: string, consentId: string, reason: string) {
  return apiPatch<{ data?: { id: string; revoked_at: string | null } }>(
    `${BASE}/${intakeId}/consents/${consentId}/revoke`,
    { reason },
  );
}
