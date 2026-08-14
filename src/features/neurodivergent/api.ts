import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { IntakeSubmitInput, NeurodivergentIntake } from "./types";

export type IntakesListParams = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
};

const BASE = "/api/v1/neurodivergent-intakes";

export function listIntakes(params: IntakesListParams) {
  return apiGet<{ data: NeurodivergentIntake[]; pagination?: Pagination }>(BASE, {
    page: params.page,
    limit: params.limit,
    status: params.status || undefined,
    search: params.search || undefined,
  });
}

export type IntakeDetailResponse = {
  intake?: NeurodivergentIntake;
} & Partial<NeurodivergentIntake>;

export function getIntake(id: string) {
  return apiGet<IntakeDetailResponse>(`${BASE}/${id}`);
}

export function submitIntake(input: IntakeSubmitInput) {
  return apiPost<{ intake?: NeurodivergentIntake; protocol?: string }>(`${BASE}/submit`, input);
}

export function revokeIntakeConsent(intakeId: string, consentId: string, reason?: string) {
  return apiPatch<{ consent?: { id: string; revoked_at: string | null } }>(
    `${BASE}/${intakeId}/consents/${consentId}/revoke`,
    reason ? { reason } : {},
  );
}

export function unwrapIntake(payload: IntakeDetailResponse | undefined) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.intake) return payload.intake;
  return payload.id ? (payload as NeurodivergentIntake) : null;
}
