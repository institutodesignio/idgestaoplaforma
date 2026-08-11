export type ProjectStatus =
  | "PLANNING"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type Project = {
  id: string;
  name: string;
  slug: string | null;
  short_name: string | null;
  description: string | null;
  status: ProjectStatus | string;
  starts_at: string | null;
  ends_at: string | null;
  has_clinical_care: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProjectInput = {
  name: string;
  slug?: string | null;
  short_name?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  has_clinical_care?: boolean;
};

export type ProjectUnit = {
  id: string;
  unit_id: string;
  unit?: { id?: string; name?: string; is_headquarters?: boolean | null } | null;
  unit_name?: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_primary: boolean | null;
};

export type ProjectUnitInput = {
  unit_id: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_primary?: boolean;
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNING: "Planejamento",
  APPROVED: "Aprovado",
  ACTIVE: "Em execução",
  SUSPENDED: "Suspenso",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  ARCHIVED: "Arquivado",
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);