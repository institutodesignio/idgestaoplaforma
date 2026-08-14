import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCareRequest,
  listCareRequests,
  updateCareRequest,
  type CareRequestsListParams,
} from "./api";
import type { CareRequestInput, CareRequestUpdate } from "./types";

export const careRequestKeys = {
  all: ["care-requests"] as const,
  list: (params: CareRequestsListParams) => ["care-requests", "list", params] as const,
};

export function useCareRequestsList(params: CareRequestsListParams, enabled = true) {
  return useQuery({
    queryKey: careRequestKeys.list(params),
    queryFn: () => listCareRequests(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useCreateCareRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CareRequestInput) => createCareRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careRequestKeys.all }),
  });
}

export function useUpdateCareRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CareRequestUpdate }) =>
      updateCareRequest(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careRequestKeys.all }),
  });
}
