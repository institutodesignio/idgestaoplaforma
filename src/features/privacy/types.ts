export type PrivacyRequestType =
  | "ACCESS"
  | "CORRECTION"
  | "DELETION"
  | "PORTABILITY"
  | "CONSENT_REVOCATION"
  | "INFORMATION";

export type PrivacyRequestStatus =
  | "RECEIVED"
  | "IN_ANALYSIS"
  | "AWAITING_REQUESTER"
  | "FULFILLED"
  | "REJECTED";

export type PrivacyRequest = {
  id: string;
  protocol?: string | null;
  request_type: PrivacyRequestType | string;
  status: PrivacyRequestStatus | string;
  person_id: string | null;
  person?: { id?: string; full_name?: string | null } | null;
  requester_name: string | null;
  requester_email: string | null;
  description: string | null;
  response_notes?: string | null;
  received_at: string | null;
  due_at: string | null;
  resolved_at: string | null;
  created_at?: string | null;
};

export type PrivacyRequestInput = {
  request_type: PrivacyRequestType;
  person_id?: string | null;
  requester_name: string;
  requester_email: string;
  description: string;
};

export type PrivacyRequestUpdate = {
  status?: PrivacyRequestStatus;
  response_notes?: string | null;
  resolved_at?: string | null;
};

export type RetentionReview = {
  id: string;
  resource_type: string | null;
  resource_id: string | null;
  person?: { id?: string; full_name?: string | null } | null;
  retention_policy?: string | null;
  status: string | null;
  decision?: string | null;
  due_at: string | null;
  reviewed_at: string | null;
  notes?: string | null;
};

export type RetentionReviewUpdate = {
  decision: string;
  notes?: string | null;
};

export const PRIVACY_REQUEST_TYPE_LABEL: Record<string, string> = {
  ACCESS: "Acesso aos dados",
  CORRECTION: "Correção de dados",
  DELETION: "Eliminação de dados",
  PORTABILITY: "Portabilidade",
  CONSENT_REVOCATION: "Revogação de consentimento",
  INFORMATION: "Informação sobre tratamento",
};

export const PRIVACY_REQUEST_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recebida",
  IN_ANALYSIS: "Em análise",
  AWAITING_REQUESTER: "Aguardando titular",
  FULFILLED: "Atendida",
  REJECTED: "Recusada",
};

export const PRIVACY_REQUEST_TYPE_OPTIONS = Object.entries(PRIVACY_REQUEST_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const PRIVACY_REQUEST_STATUS_OPTIONS = Object.entries(PRIVACY_REQUEST_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const RETENTION_DECISION_OPTIONS = [
  { value: "KEEP", label: "Manter pelo prazo legal" },
  { value: "ANONYMIZE", label: "Anonimizar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "POSTPONE", label: "Reavaliar depois" },
];

export const RETENTION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  IN_REVIEW: "Em revisão",
  COMPLETED: "Concluída",
  OVERDUE: "Atrasada",
};

/** Prazo legal: destacamos atraso e proximidade sem inventar datas. */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86_400_000);
}