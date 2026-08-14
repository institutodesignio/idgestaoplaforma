import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { Member, MemberRole, MemberRoleInput, Role } from "./types";

export type MembersListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

export type MembersListResponse = { data: Member[]; pagination?: Pagination };

export function listMembers(params: MembersListParams) {
  return apiGet<MembersListResponse>("/api/v1/members", {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: params.status || undefined,
  });
}

export type MemberDetailResponse = { member?: Member; roles?: MemberRole[] } & Partial<Member>;

export function getMember(memberId: string) {
  return apiGet<MemberDetailResponse>(`/api/v1/members/${memberId}`);
}

export function listRoles() {
  return apiGet<{ data?: Role[]; roles?: Role[] }>("/api/v1/roles");
}

export function assignMemberRole(memberId: string, input: MemberRoleInput) {
  return apiPost<{ member_role?: MemberRole }>(`/api/v1/members/${memberId}/roles`, input);
}

/** Encerramento temporal — o histórico de papéis nunca é apagado. */
export function endMemberRole(memberId: string, memberRoleId: string, endsAt: string) {
  return apiPatch<{ member_role?: MemberRole }>(
    `/api/v1/members/${memberId}/roles/${memberRoleId}`,
    { ends_at: endsAt },
  );
}

export function unwrapMember(payload: MemberDetailResponse | undefined): Member | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.member) return payload.member;
  return payload.id ? (payload as Member) : null;
}

export type MemberInviteInput = { email: string; full_name: string; role_id: string };

/** Convite institucional — exige user.invite e user.manage_roles. */
export function inviteMember(input: MemberInviteInput) {
  return apiPost<{ member?: Member; invite?: { id: string } }>("/api/v1/members/invite", input);
}