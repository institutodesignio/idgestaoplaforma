import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIntake,
  listIntakes,
  revokeIntakeConsent,
  submitIntake,
  type IntakesListParams,
} from "./api";
import type { IntakeSubmitInput } from "./types";

export const intakeKeys = {
  all: ["neurodivergent-intakes"] as const,
  list: (params: IntakesListParams) => ["neurodivergent-intakes", "list", params] as const,
  detail: (id: string) => ["neurodivergent-intakes", "detail", id] as const,
};

export function useIntakesList(params: IntakesListParams, enabled = true) {
  return useQuery({
    queryKey: intakeKeys.list(params),
    queryFn: () => listIntakes(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useIntake(id: string, enabled = true) {
  return useQuery({
    queryKey: intakeKeys.detail(id),
    queryFn: async () => (await getIntake(id)).data ?? null,
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export function useSubmitIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IntakeSubmitInput) => submitIntake(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: intakeKeys.all }),
  });
}

export function useRevokeConsent(intakeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ consentId, reason }: { consentId: string; reason: string }) =>
      revokeIntakeConsent(intakeId, consentId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: intakeKeys.all }),
  });
}
