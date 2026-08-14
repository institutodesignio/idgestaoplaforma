export type SupervisionCaseStatus = "OPEN" | "IN_FOLLOW_UP" | "PAUSED" | "CLOSED";

export type SupervisionPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type SupervisionCase = {
  id: string;
  project_id: string | null;
  beneficiary_person_id: string | null;
  assigned_technical_person_id: string | null;
  status: SupervisionCaseStatus | string;
  priority: SupervisionPriority | string | null;
  summary: string | null;
  opened_at: string | null;
  closed_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SupervisionCaseInput = {
  project_id: string;
  beneficiary_person_id: string;
  assigned_technical_person_id?: string | null;
  priority?: SupervisionPriority;
  summary: string;
};

export type SupervisionCaseUpdate = {
  assigned_technical_person_id?: string | null;
  priority?: SupervisionPriority;
  status?: SupervisionCaseStatus;
  summary?: string;
};

export type SupervisionSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type SupervisionSession = {
  id: string;
  case_id: string | null;
  supervisor_person_id: string | null;
  scheduled_at: string | null;
  status: SupervisionSessionStatus | string;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SupervisionSessionInput = {
  supervisor_person_id: string;
  /** ISO 8601 com offset. */
  scheduled_at: string;
  notes?: string | null;
};

export type SupervisionSessionUpdate = {
  scheduled_at?: string;
  status?: SupervisionSessionStatus;
  notes?: string | null;
};

export const SUPERVISION_CASE_STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_FOLLOW_UP: "Em acompanhamento",
  PAUSED: "Pausado",
  CLOSED: "Encerrado",
};

export const SUPERVISION_PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const SUPERVISION_PRIORITY_OPTIONS = Object.entries(SUPERVISION_PRIORITY_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const SUPERVISION_CASE_STATUS_OPTIONS = Object.entries(SUPERVISION_CASE_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const SUPERVISION_SESSION_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Realizada",
  NO_SHOW: "Ausência",
  CANCELLED: "Cancelada",
};

export const SUPERVISION_SESSION_STATUS_OPTIONS = Object.entries(
  SUPERVISION_SESSION_STATUS_LABEL,
).map(([value, label]) => ({ value, label }));
