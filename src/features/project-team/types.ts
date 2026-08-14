/** Vínculo temporal de uma pessoa a um projeto (project_team_members). */
export type ProjectTeamMember = {
  id: string;
  project_id: string;
  person_id: string;
  role_title: string | null;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  person?: {
    id?: string;
    full_name?: string | null;
    preferred_name?: string | null;
    primary_email?: string | null;
    primary_phone?: string | null;
  } | null;
};

export type ProjectTeamInput = {
  person_id: string;
  role_title: string;
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string | null;
};

/** PATCH nunca altera a pessoa vinculada. */
export type ProjectTeamUpdate = {
  role_title?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string | null;
};

export const ROLE_TITLE_MAX_LENGTH = 120;

export function teamPersonName(item: ProjectTeamMember): string {
  return item.person?.full_name ?? item.person?.preferred_name ?? "Pessoa da equipe";
}

export function teamRoleLabel(item: ProjectTeamMember): string {
  return item.role_title?.trim() || "Participação";
}

export function isTeamMemberActive(item: ProjectTeamMember): boolean {
  if (!item.ends_at) return true;
  return new Date(item.ends_at).getTime() >= new Date().setHours(0, 0, 0, 0);
}
