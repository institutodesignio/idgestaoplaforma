import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProjectTeamMember,
  listProjectTeam,
  removeProjectTeamMember,
  updateProjectTeamMember,
} from "./api";
import type { ProjectTeamInput, ProjectTeamUpdate } from "./types";

export const projectTeamKeys = {
  all: ["project-team"] as const,
  list: (projectId: string) => ["project-team", projectId] as const,
};

export function useProjectTeam(projectId: string, enabled = true) {
  return useQuery({
    queryKey: projectTeamKeys.list(projectId),
    queryFn: async () => {
      const payload = await listProjectTeam(projectId);
      return payload.data ?? [];
    },
    enabled: enabled && Boolean(projectId),
    retry: false,
  });
}

export type SaveProjectTeamArgs =
  | { teamMemberId: string; input: ProjectTeamUpdate }
  | { teamMemberId?: undefined; input: ProjectTeamInput };

export function useSaveProjectTeamMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: SaveProjectTeamArgs) =>
      args.teamMemberId
        ? updateProjectTeamMember(projectId, args.teamMemberId, args.input)
        : addProjectTeamMember(projectId, args.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectTeamKeys.list(projectId) }),
  });
}

export function useRemoveProjectTeamMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamMemberId: string) => removeProjectTeamMember(projectId, teamMemberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectTeamKeys.list(projectId) }),
  });
}
