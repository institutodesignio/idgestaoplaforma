import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { ProjectTeamInput, ProjectTeamMember } from "./types";

export function listProjectTeam(projectId: string) {
  return apiGet<{ data?: ProjectTeamMember[]; team?: ProjectTeamMember[] }>(
    `/api/v1/projects/${projectId}/team`,
  );
}

export function addProjectTeamMember(projectId: string, input: ProjectTeamInput) {
  return apiPost<{ team_member?: ProjectTeamMember }>(
    `/api/v1/projects/${projectId}/team`,
    input,
  );
}

export function updateProjectTeamMember(
  projectId: string,
  memberId: string,
  input: Partial<ProjectTeamInput>,
) {
  return apiPatch<{ team_member?: ProjectTeamMember }>(
    `/api/v1/projects/${projectId}/team/${memberId}`,
    input,
  );
}

/** Encerramento do vínculo — o histórico é preservado pelo backend. */
export function removeProjectTeamMember(projectId: string, memberId: string) {
  return apiDelete<void>(`/api/v1/projects/${projectId}/team/${memberId}`);
}