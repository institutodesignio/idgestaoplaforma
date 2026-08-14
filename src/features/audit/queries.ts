import { useQuery } from "@tanstack/react-query";
import { listAuditEvents, type AuditListParams } from "./api";

export const auditKeys = {
  list: (params: AuditListParams) => ["audit-events", params] as const,
};

export function useAuditEvents(params: AuditListParams, enabled = true) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => listAuditEvents(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}