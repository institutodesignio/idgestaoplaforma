import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  linkProjectUnit,
  listProjectUnits,
  listProjects,
  unlinkProjectUnit,
  unwrapProject,
  updateProject,
  updateProjectUnit,
  type ProjectsListParams,
} from "./api";
import type { ProjectInput, ProjectUnit, ProjectUnitInput } from "./types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: ProjectsListParams) => ["projects", "list", params] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
  units: (id: string) => ["projects", "units", id] as const,
};

export function useProjectsList(params: ProjectsListParams, enabled = true) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => listProjects(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const payload = await getProject(id);
      return { project: unwrapProject(payload), units: payload.units ?? null };
    },
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

/** Unidades do projeto: usa a coleção do detalhe quando existir, senão busca a rota dedicada. */
export function useProjectUnits(projectId: string, embedded: ProjectUnit[] | null | undefined) {
  return useQuery({
    queryKey: projectKeys.units(projectId),
    queryFn: async () => {
      const payload = await listProjectUnits(projectId);
      return payload.data ?? payload.units ?? [];
    },
    enabled: Boolean(projectId) && !embedded,
    retry: false,
  });
}

export function useSaveProject(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) =>
      projectId ? updateProject(projectId, input) : createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useSaveProjectUnit(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectUnitId, input }: { projectUnitId?: string; input: ProjectUnitInput }) =>
      projectUnitId
        ? updateProjectUnit(projectId, projectUnitId, input)
        : linkProjectUnit(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUnlinkProjectUnit(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectUnitId: string) => unlinkProjectUnit(projectId, projectUnitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
