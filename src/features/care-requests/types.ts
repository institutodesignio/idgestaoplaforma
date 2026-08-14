export type CareRequestStatus =
  | "IDENTIFIED"
  | "WAITING"
  | "REFERRED"
  | "IN_SERVICE"
  | "COMPLETED"
  | "CANCELLED";

export type CareRequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type CareRequest = {
  id: string;
  person_id: string | null;
  intake_id: string | null;
  project_id: string | null;
  category: string | null;
  description: string | null;
  priority: CareRequestPriority | string | null;
  status: CareRequestStatus | string;
  waiting_since: string | null;
  referral_destination: string | null;
  assigned_person_id: string | null;
  resolved_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CareRequestInput = {
  person_id: string;
  intake_id?: string | null;
  project_id?: string | null;
  category: string;
  description: string;
  priority?: CareRequestPriority;
  status?: CareRequestStatus;
  /** YYYY-MM-DD */
  waiting_since?: string | null;
  referral_destination?: string | null;
  assigned_person_id?: string | null;
};

export type CareRequestUpdate = {
  project_id?: string | null;
  category?: string;
  description?: string;
  priority?: CareRequestPriority;
  status?: CareRequestStatus;
  waiting_since?: string | null;
  referral_destination?: string | null;
  assigned_person_id?: string | null;
};

export const CARE_REQUEST_STATUS_LABEL: Record<string, string> = {
  IDENTIFIED: "Identificada",
  WAITING: "Em espera",
  REFERRED: "Encaminhada",
  IN_SERVICE: "Em atendimento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const CARE_REQUEST_PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const CARE_REQUEST_STATUS_OPTIONS = Object.entries(CARE_REQUEST_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const CARE_REQUEST_PRIORITY_OPTIONS = Object.entries(CARE_REQUEST_PRIORITY_LABEL).map(
  ([value, label]) => ({ value, label }),
);

/** Dias de espera calculados a partir do dado devolvido pela API. */
export function waitingDays(request: CareRequest): number | null {
  const reference = request.waiting_since ?? request.created_at;
  if (!reference) return null;
  const start = new Date(reference).getTime();
  if (Number.isNaN(start)) return null;
  const end = request.resolved_at ? new Date(request.resolved_at).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}
