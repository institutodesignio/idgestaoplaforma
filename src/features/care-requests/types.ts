export type CareRequestStatus =
  "RECEIVED" | "IN_ANALYSIS" | "WAITING_LIST" | "REFERRED" | "IN_CARE" | "CONCLUDED" | "CANCELLED";

export type CareRequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type CareRequest = {
  id: string;
  person_id: string | null;
  person?: { id?: string; full_name?: string | null } | null;
  person_name?: string | null;
  project_id?: string | null;
  project?: { id?: string; name?: string | null } | null;
  unit_id?: string | null;
  status: CareRequestStatus | string;
  priority: CareRequestPriority | string | null;
  requested_service: string | null;
  description: string | null;
  referral_destination: string | null;
  referral_notes?: string | null;
  waiting_since: string | null;
  requested_at?: string | null;
  concluded_at: string | null;
  conclusion_notes?: string | null;
  created_at?: string | null;
};

export type CareRequestInput = {
  person_id: string;
  project_id?: string | null;
  requested_service: string;
  description?: string | null;
  priority: CareRequestPriority;
  status?: CareRequestStatus;
};

export type CareRequestUpdate = {
  status?: CareRequestStatus;
  priority?: CareRequestPriority;
  requested_service?: string;
  description?: string | null;
  referral_destination?: string | null;
  referral_notes?: string | null;
  conclusion_notes?: string | null;
  concluded_at?: string | null;
};

export const CARE_REQUEST_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recebida",
  IN_ANALYSIS: "Em análise",
  WAITING_LIST: "Lista de espera",
  REFERRED: "Encaminhada",
  IN_CARE: "Em atendimento",
  CONCLUDED: "Concluída",
  CANCELLED: "Cancelada",
};

export const CARE_REQUEST_PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const CARE_REQUEST_STATUS_OPTIONS = Object.entries(CARE_REQUEST_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const CARE_REQUEST_PRIORITY_OPTIONS = Object.entries(CARE_REQUEST_PRIORITY_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export function careRequestPersonName(request: CareRequest): string {
  return request.person?.full_name ?? request.person_name ?? "Pessoa não identificada";
}

/** Dias de espera calculados a partir do dado devolvido pela API. */
export function waitingDays(request: CareRequest): number | null {
  const reference = request.waiting_since ?? request.requested_at ?? request.created_at;
  if (!reference) return null;
  const start = new Date(reference).getTime();
  if (Number.isNaN(start)) return null;
  const end = request.concluded_at ? new Date(request.concluded_at).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}
