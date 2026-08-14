import type { Member } from "@/features/members/types";

/** Vínculo temporal de um membro institucional a um projeto. */
export type ProjectTeamMember = {
  id?: string;
  member_id: string;
  member?: Member | null;
  full_name?: string | null;
  email?: string | null;
  project_role?: string | null;
  role?: string | null;
  starts_at: string | null;
  ends_at: string | null;
  notes?: string | null;
};

export type ProjectTeamInput = {
  member_id: string;
  project_role: string;
  starts_at: string;
  ends_at?: string | null;
  notes?: string | null;
};

export const PROJECT_ROLE_LABEL: Record<string, string> = {
  COORDINATOR: "Coordenação",
  TECHNICAL_RESPONSIBLE: "Responsável Técnico",
  SUPERVISOR: "Supervisão",
  PROFESSIONAL: "Profissional",
  ASSISTANT: "Apoio",
  INTERN: "Estágio",
  VOLUNTEER: "Voluntariado",
};

export const PROJECT_ROLE_OPTIONS = Object.entries(PROJECT_ROLE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export function teamRoleCode(item: ProjectTeamMember): string {
  return item.project_role ?? item.role ?? "";
}

export function teamRoleLabel(item: ProjectTeamMember): string {
  const code = teamRoleCode(item);
  return PROJECT_ROLE_LABEL[code] ?? code ?? "Participação";
}

export function isTeamMemberActive(item: ProjectTeamMember): boolean {
  if (!item.ends_at) return true;
  return new Date(item.ends_at).getTime() >= new Date().setHours(0, 0, 0, 0);
}