import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Pagination } from "@/features/persons/types";
import type { Project, ProjectInput, ProjectUnit, ProjectUnitInput } from "./types";

export type ProjectsListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  has_clinical_care?: boolean | undefined;
};

export type ProjectsListResponse = { data: Project[]; pagination?: Pagination };

export function listProjects(params: ProjectsListParams) {
  return apiGet<ProjectsListResponse>("/api/v1/projects", {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: params.status || undefined,
    has_clinical_care:
      params.has_clinical_care === undefined ? undefined : params.has_clinical_care,
  });
}

export type ProjectDetailResponse = {
  data?: Project;
  project?: Project;
  units?: ProjectUnit[];
} & Partial<Project>;

export function getProject(id: string) {
  return apiGet<ProjectDetailResponse>(`/api/v1/projects/${id}`);
}


export function listProjectUnits(projectId: string) {
  return apiGet<{ data?: ProjectUnit[]; units?: ProjectUnit[] }>(
    `/api/v1/projects/${projectId}/units`,
  );
}

export function createProject(input: ProjectInput) {
  return apiPost<{ project?: Project } | Project>("/api/v1/projects", input);
}

export function updateProject(id: string, input: Partial<ProjectInput>) {
  return apiPatch<{ project?: Project } | Project>(`/api/v1/projects/${id}`, input);
}

/** Exclusão lógica (soft delete) executada pelo backend. */
export function deleteProject(id: string) {
  return apiDelete<void>(`/api/v1/projects/${id}`);
}

export function linkProjectUnit(projectId: string, input: ProjectUnitInput) {
  return apiPost<{ project_unit?: ProjectUnit }>(`/api/v1/projects/${projectId}/units`, input);
}

export function updateProjectUnit(
  projectId: string,
  projectUnitId: string,
  input: Partial<ProjectUnitInput>,
) {
  return apiPatch<{ project_unit?: ProjectUnit }>(
    `/api/v1/projects/${projectId}/units/${projectUnitId}`,
    input,
  );
}

export function unlinkProjectUnit(projectId: string, projectUnitId: string) {
  return apiDelete<void>(`/api/v1/projects/${projectId}/units/${projectUnitId}`);
}

export function unwrapProject(payload: ProjectDetailResponse | undefined): Project | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.project) return payload.project;
  return payload.id ? (payload as Project) : null;
}
