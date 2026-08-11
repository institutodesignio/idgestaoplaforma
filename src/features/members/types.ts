export type Role = {
  id: string;
  code: string;
  name: string | null;
  description?: string | null;
};

export type MemberRole = {
  id: string;
  role_id: string;
  role?: Role | null;
  role_code?: string | null;
  role_name?: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export type Member = {
  id: string;
  user_id?: string | null;
  status: string | null;
  joined_at?: string | null;
  starts_at?: string | null;
  created_at?: string | null;
  user?: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
  profile?: {
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  email?: string | null;
  full_name?: string | null;
  roles?: MemberRole[] | null;
};

export type MemberRoleInput = {
  role_id: string;
  starts_at: string;
  ends_at?: string | null;
};

export const MEMBER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING: "Pendente",
  SUSPENDED: "Suspenso",
  ARCHIVED: "Arquivado",
};

/** O Responsável Técnico tem atuação transversal — destacado na interface. */
export const TECHNICAL_RESPONSIBLE_CODE = "TECHNICAL_RESPONSIBLE";

export function memberDisplayName(member: Member): string {
  return (
    member.full_name ??
    member.profile?.full_name ??
    member.user?.full_name ??
    member.user?.name ??
    memberEmail(member) ??
    "Membro sem identificação"
  );
}

export function memberEmail(member: Member): string | null {
  return member.email ?? member.profile?.email ?? member.user?.email ?? null;
}

export function memberJoinedAt(member: Member): string | null {
  return member.joined_at ?? member.starts_at ?? member.created_at ?? null;
}

export function roleCode(role: MemberRole): string {
  return role.role?.code ?? role.role_code ?? "";
}

export function roleLabel(role: MemberRole): string {
  return role.role?.name ?? role.role_name ?? roleCode(role) ?? "Papel institucional";
}

export function isRoleActive(role: MemberRole): boolean {
  if (!role.ends_at) return true;
  return new Date(role.ends_at).getTime() >= new Date().setHours(0, 0, 0, 0);
}