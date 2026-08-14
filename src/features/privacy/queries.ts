import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrivacyRequest,
  listPrivacyRequests,
  listRetentionReviews,
  updatePrivacyRequest,
  updateRetentionReview,
  type PrivacyRequestsListParams,
} from "./api";
import type { PrivacyRequestInput, PrivacyRequestUpdate, RetentionReviewUpdate } from "./types";

export const privacyKeys = {
  all: ["privacy"] as const,
  requests: (params: PrivacyRequestsListParams) => ["privacy", "requests", params] as const,
  retention: ["privacy", "retention-reviews"] as const,
};

export function usePrivacyRequests(params: PrivacyRequestsListParams, enabled = true) {
  return useQuery({
    queryKey: privacyKeys.requests(params),
    queryFn: () => listPrivacyRequests(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useRetentionReviews(enabled = true) {
  return useQuery({
    queryKey: privacyKeys.retention,
    queryFn: async () => {
      const payload = await listRetentionReviews();
      return payload.data ?? payload.reviews ?? [];
    },
    enabled,
    retry: false,
  });
}

export function useCreatePrivacyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrivacyRequestInput) => createPrivacyRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: privacyKeys.all }),
  });
}

export function useUpdatePrivacyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PrivacyRequestUpdate }) =>
      updatePrivacyRequest(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: privacyKeys.all }),
  });
}

export function useUpdateRetentionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RetentionReviewUpdate }) =>
      updateRetentionReview(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: privacyKeys.all }),
  });
}
