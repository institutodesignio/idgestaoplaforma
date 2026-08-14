import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupervisionCase,
  createSupervisionSession,
  getSupervisionCase,
  listSupervisionCases,
  listSupervisionSessions,
  unwrapSupervisionCase,
  updateSupervisionCase,
  updateSupervisionSession,
  type SupervisionCasesListParams,
} from "./api";
import type {
  SupervisionCaseInput,
  SupervisionCaseUpdate,
  SupervisionSessionInput,
  SupervisionSessionUpdate,
} from "./types";

export const supervisionKeys = {
  all: ["clinical-supervision"] as const,
  list: (params: SupervisionCasesListParams) =>
    ["clinical-supervision", "list", params] as const,
  detail: (id: string) => ["clinical-supervision", "detail", id] as const,
  sessions: (id: string) => ["clinical-supervision", "sessions", id] as const,
};

export function useSupervisionCases(params: SupervisionCasesListParams, enabled = true) {
  return useQuery({
    queryKey: supervisionKeys.list(params),
    queryFn: () => listSupervisionCases(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSupervisionCase(id: string, enabled = true) {
  return useQuery({
    queryKey: supervisionKeys.detail(id),
    queryFn: async () => {
      const payload = await getSupervisionCase(id);
      return { case: unwrapSupervisionCase(payload), sessions: payload.sessions ?? null };
    },
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export function useSupervisionSessions(caseId: string, enabled = true) {
  return useQuery({
    queryKey: supervisionKeys.sessions(caseId),
    queryFn: async () => {
      const payload = await listSupervisionSessions(caseId);
      return payload.data ?? payload.sessions ?? [];
    },
    enabled: enabled && Boolean(caseId),
    retry: false,
  });
}

export function useCreateSupervisionCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupervisionCaseInput) => createSupervisionCase(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supervisionKeys.all }),
  });
}

export function useUpdateSupervisionCase(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupervisionCaseUpdate) => updateSupervisionCase(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supervisionKeys.all }),
  });
}

export function useSaveSupervisionSession(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      input,
    }: {
      sessionId?: string;
      input: SupervisionSessionInput | SupervisionSessionUpdate;
    }) =>
      sessionId
        ? updateSupervisionSession(caseId, sessionId, input as SupervisionSessionUpdate)
        : createSupervisionSession(caseId, input as SupervisionSessionInput),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supervisionKeys.all }),
  });
}