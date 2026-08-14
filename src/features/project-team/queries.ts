import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProjectTeamMember,
  listProjectTeam,
  removeProjectTeamMember,
  updateProjectTeamMember,
} from "./api";
import type { ProjectTeamInput } from "./types";

export const projectTeamKeys = {
  all: ["project-team"] as const,
  list: (projectId: string) => ["project-team", projectId] as const,
};

export function useProjectTeam(projectId: string, enabled = true) {
  return useQuery({
    queryKey: projectTeamKeys.list(projectId),
    queryFn: async () => {
      const payload = await listProjectTeam(projectId);
      return payload.data ?? payload.team ?? [];
    },
    enabled: enabled && Boolean(projectId),
    retry: false,
  });
}

export function useSaveProjectTeamMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, input }: { memberId?: string; input: ProjectTeamInput }) =>
      memberId
        ? updateProjectTeamMember(projectId, memberId, input)
        : addProjectTeamMember(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectTeamKeys.list(projectId) }),
  });
}

export function useRemoveProjectTeamMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeProjectTeamMember(projectId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectTeamKeys.list(projectId) }),
  });
}
