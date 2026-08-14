export type SupervisionCaseStatus =
  | "OPEN"
  | "IN_SUPERVISION"
  | "ON_HOLD"
  | "CLOSED"
  | "REFERRED";

export type SupervisionCase = {
  id: string;
  code?: string | null;
  person_id: string | null;
  person?: { id?: string; full_name?: string | null } | null;
  person_name?: string | null;
  project_id: string | null;
  project?: { id?: string; name?: string | null } | null;
  status: SupervisionCaseStatus | string;
  technical_responsible_member_id: string | null;
  technical_responsible?: { id?: string; full_name?: string | null; email?: string | null } | null;
  opened_at: string | null;
  closed_at: string | null;
  summary: string | null;
  created_at?: string | null;
  sessions_count?: number | null;
};

export type SupervisionCaseInput = {
  person_id: string;
  project_id?: string | null;
  technical_responsible_member_id: string;
  status?: SupervisionCaseStatus;
  opened_at?: string | null;
  summary?: string | null;
};

export type SupervisionCaseUpdate = Partial<SupervisionCaseInput> & {
  closed_at?: string | null;
};

export type SupervisionSessionStatus = "SCHEDULED" | "HELD" | "MISSED" | "CANCELLED";

export type SupervisionSession = {
  id: string;
  case_id?: string | null;
  scheduled_at: string | null;
  held_at: string | null;
  status: SupervisionSessionStatus | string;
  modality: string | null;
  supervisor_member_id?: string | null;
  supervisor?: { id?: string; full_name?: string | null } | null;
  agenda: string | null;
  deliberations: string | null;
};

export type SupervisionSessionInput = {
  scheduled_at: string;
  modality: string;
  status?: SupervisionSessionStatus;
  supervisor_member_id?: string | null;
  agenda?: string | null;
};

export type SupervisionSessionUpdate = {
  status?: SupervisionSessionStatus;
  scheduled_at?: string | null;
  held_at?: string | null;
  modality?: string;
  agenda?: string | null;
  deliberations?: string | null;
};

export const SUPERVISION_CASE_STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_SUPERVISION: "Em supervisão",
  ON_HOLD: "Aguardando",
  REFERRED: "Encaminhado",
  CLOSED: "Encerrado",
};

export const SUPERVISION_CASE_STATUS_OPTIONS = Object.entries(
  SUPERVISION_CASE_STATUS_LABEL,
).map(([value, label]) => ({ value, label }));

export const SUPERVISION_SESSION_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendada",
  HELD: "Realizada",
  MISSED: "Não realizada",
  CANCELLED: "Cancelada",
};

export const SUPERVISION_SESSION_STATUS_OPTIONS = Object.entries(
  SUPERVISION_SESSION_STATUS_LABEL,
).map(([value, label]) => ({ value, label }));

export const SUPERVISION_MODALITY_OPTIONS = [
  { value: "IN_PERSON", label: "Presencial" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Híbrida" },
];

export const SUPERVISION_MODALITY_LABEL: Record<string, string> = {
  IN_PERSON: "Presencial",
  ONLINE: "Online",
  HYBRID: "Híbrida",
};

export function casePersonName(item: SupervisionCase): string {
  return item.person?.full_name ?? item.person_name ?? "Pessoa acompanhada";
}

export function caseTechnicalResponsible(item: SupervisionCase): string {
  return (
    item.technical_responsible?.full_name ??
    item.technical_responsible?.email ??
    "Responsável Técnico não definido"
  );
}