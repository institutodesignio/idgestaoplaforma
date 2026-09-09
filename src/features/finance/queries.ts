import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveFinanceTransaction,
  createFinanceTransaction,
  createFinanceSetupItem,
  getFinanceSetup,
  getFinanceSummary,
  listFinanceTransactions,
  reconcileFinanceTransaction,
  type FinanceTransactionParams,
} from "./api";
import type { FinanceSetupCreate, FinanceTransactionInput } from "./types";

export const financeKeys = { all: ["finance"] as const };

export function useFinanceSetup(year: number) {
  return useQuery({
    queryKey: ["finance", "setup", year],
    queryFn: () => getFinanceSetup(year),
    retry: false,
  });
}
export function useFinanceTransactions(params: FinanceTransactionParams) {
  return useQuery({
    queryKey: ["finance", "transactions", params],
    queryFn: () => listFinanceTransactions(params),
    retry: false,
  });
}
export function useFinanceSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["finance", "summary", from, to],
    queryFn: () => getFinanceSummary(from, to),
    retry: false,
  });
}
export function useCreateFinanceTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: FinanceTransactionInput) => createFinanceTransaction(input),
    onSuccess: () => client.invalidateQueries({ queryKey: financeKeys.all }),
  });
}
export function useCreateFinanceSetupItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: FinanceSetupCreate) => createFinanceSetupItem(request),
    onSuccess: () => client.invalidateQueries({ queryKey: financeKeys.all }),
  });
}
export function useApproveFinanceTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paid }: { id: string; paid?: boolean }) =>
      approveFinanceTransaction(id, paid),
    onSuccess: () => client.invalidateQueries({ queryKey: financeKeys.all }),
  });
}
export function useReconcileFinanceTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reconcileFinanceTransaction(id),
    onSuccess: () => client.invalidateQueries({ queryKey: financeKeys.all }),
  });
}
