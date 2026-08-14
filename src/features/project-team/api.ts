import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { ProjectTeamInput, ProjectTeamMember, ProjectTeamUpdate } from "./types";

export function listProjectTeam(projectId: string) {
  return apiGet<{ data: ProjectTeamMember[] }>(`/api/v1/projects/${projectId}/team`);
}

export function addProjectTeamMember(projectId: string, input: ProjectTeamInput) {
  return apiPost<{ data?: ProjectTeamMember }>(`/api/v1/projects/${projectId}/team`, input);
}

/** `teamMemberId` é o id do vínculo em project_team_members. */
export function updateProjectTeamMember(
  projectId: string,
  teamMemberId: string,
  input: ProjectTeamUpdate,
) {
  return apiPatch<{ data?: ProjectTeamMember }>(
    `/api/v1/projects/${projectId}/team/${teamMemberId}`,
    input,
  );
}

/** Encerramento do vínculo — o histórico é preservado pelo backend. */
export function removeProjectTeamMember(projectId: string, teamMemberId: string) {
  return apiDelete<void>(`/api/v1/projects/${projectId}/team/${teamMemberId}`);
}
