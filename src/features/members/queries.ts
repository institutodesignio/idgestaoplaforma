import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignMemberRole,
  endMemberRole,
  getMember,
  listMembers,
  listRoles,
  unwrapMember,
  type MembersListParams,
} from "./api";
import type { MemberRoleInput } from "./types";

export const memberKeys = {
  all: ["members"] as const,
  list: (params: MembersListParams) => ["members", "list", params] as const,
  detail: (id: string) => ["members", "detail", id] as const,
  roles: ["roles"] as const,
};

export function useMembersList(params: MembersListParams, enabled = true) {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: () => listMembers(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useMember(memberId: string, enabled = true) {
  return useQuery({
    queryKey: memberKeys.detail(memberId),
    queryFn: async () => {
      const payload = await getMember(memberId);
      const member = unwrapMember(payload);
      return { member, roles: payload.roles ?? member?.roles ?? [] };
    },
    enabled: enabled && Boolean(memberId),
    retry: false,
  });
}

/** Papéis institucionais sempre carregados da API — nunca hardcoded. */
export function useRoles(enabled = true) {
  return useQuery({
    queryKey: memberKeys.roles,
    queryFn: async () => {
      const payload = await listRoles();
      return payload.data ?? payload.roles ?? [];
    },
    enabled,
    retry: false,
  });
}

export function useAssignMemberRole(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MemberRoleInput) => assignMemberRole(memberId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

export function useEndMemberRole(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberRoleId, endsAt }: { memberRoleId: string; endsAt: string }) =>
      endMemberRole(memberId, memberRoleId, endsAt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}