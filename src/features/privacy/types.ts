export type PrivacyRequestType =
  | "CONFIRMATION"
  | "ACCESS"
  | "CORRECTION"
  | "SHARING_INFORMATION"
  | "REVOCATION"
  | "DELETION"
  | "ANONYMIZATION";

export type PrivacyRequestStatus =
  | "RECEIVED"
  | "IDENTITY_CHECK"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DENIED";

export type PrivacyRequest = {
  id: string;
  person_id: string | null;
  request_type: PrivacyRequestType | string;
  description: string | null;
  status: PrivacyRequestStatus | string;
  received_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  decision_reason: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PrivacyRequestInput = {
  person_id: string;
  request_type: PrivacyRequestType;
  description?: string | null;
  /** YYYY-MM-DD */
  due_at?: string | null;
};

export type PrivacyRequestUpdate = {
  status?: PrivacyRequestStatus;
  due_at?: string | null;
  decision_reason?: string | null;
};

export type RetentionDecision = "KEEP_ACTIVE" | "ANONYMIZE" | "DELETE" | "LEGAL_HOLD";

export type RetentionReview = {
  id: string;
  person_id: string | null;
  last_confirmation_at: string | null;
  review_due_at: string | null;
  decision: RetentionDecision | string | null;
  decided_at: string | null;
  reason: string | null;
};

export type RetentionReviewUpdate = {
  decision: RetentionDecision;
  reason: string;
};

export const PRIVACY_REQUEST_TYPE_LABEL: Record<string, string> = {
  CONFIRMATION: "Confirmação de tratamento",
  ACCESS: "Acesso aos dados",
  CORRECTION: "Correção de dados",
  SHARING_INFORMATION: "Informação sobre compartilhamento",
  REVOCATION: "Revogação de consentimento",
  DELETION: "Eliminação de dados",
  ANONYMIZATION: "Anonimização",
};

export const PRIVACY_REQUEST_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recebida",
  IDENTITY_CHECK: "Verificação de identidade",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Atendida",
  DENIED: "Recusada",
};

export const PRIVACY_REQUEST_TYPE_OPTIONS = Object.entries(PRIVACY_REQUEST_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const PRIVACY_REQUEST_STATUS_OPTIONS = Object.entries(PRIVACY_REQUEST_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const RETENTION_DECISION_LABEL: Record<string, string> = {
  KEEP_ACTIVE: "Manter ativo",
  ANONYMIZE: "Anonimizar",
  DELETE: "Eliminar",
  LEGAL_HOLD: "Retenção legal",
};

export const RETENTION_DECISION_OPTIONS = Object.entries(RETENTION_DECISION_LABEL).map(
  ([value, label]) => ({ value, label }),
);

/** Prazo legal: destacamos atraso e proximidade sem inventar datas. */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86_400_000);
}
