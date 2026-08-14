import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupervisionCase,
  createSupervisionSession,
  listSupervisionCases,
  listSupervisionSessions,
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
  list: (params: SupervisionCasesListParams) => ["clinical-supervision", "list", params] as const,
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

/**
 * Não existe GET /cases/:id no backend: o caso é localizado na listagem
 * (aproveitando o cache do React Query).
 */
export function useSupervisionCaseFromList(caseId: string, enabled = true) {
  const params: SupervisionCasesListParams = { page: 1, limit: 100, status: "" };
  const query = useSupervisionCases(params, enabled);
  const found = (query.data?.data ?? []).find((item) => item.id === caseId) ?? null;
  return { ...query, supervisionCase: found };
}

export function useSupervisionSessions(caseId: string, enabled = true) {
  return useQuery({
    queryKey: supervisionKeys.sessions(caseId),
    queryFn: async () => {
      const payload = await listSupervisionSessions(caseId);
      return payload.data ?? [];
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
    mutationFn: (
      args:
        | { mode: "create"; input: SupervisionSessionInput }
        | { mode: "update"; sessionId: string; input: SupervisionSessionUpdate },
    ) =>
      args.mode === "update"
        ? updateSupervisionSession(caseId, args.sessionId, args.input)
        : createSupervisionSession(caseId, args.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supervisionKeys.all }),
  });
}
