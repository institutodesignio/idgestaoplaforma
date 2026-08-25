import { apiGet, apiPost } from "@/lib/api";
import type {
  FinanceSetup,
  FinanceSetupCreate,
  FinanceSummary,
  FinanceTransaction,
  FinanceTransactionInput,
} from "./types";

export type FinanceTransactionParams = {
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  project_id?: string;
  cost_center_id?: string;
};

export function getFinanceSetup(fiscalYear: number) {
  return apiGet<{ data: FinanceSetup }>("/api/v1/finance/setup", { fiscal_year: fiscalYear });
}

export function listFinanceTransactions(params: FinanceTransactionParams) {
  return apiGet<{ data: FinanceTransaction[] }>("/api/v1/finance/transactions", params);
}

export function getFinanceSummary(from: string, to: string) {
  return apiGet<{ data: FinanceSummary }>("/api/v1/finance/summary", { from, to });
}

export function createFinanceTransaction(input: FinanceTransactionInput) {
  return apiPost<{ data: FinanceTransaction }>("/api/v1/finance/transactions", input);
}

export function createFinanceSetupItem(request: FinanceSetupCreate) {
  const path =
    request.kind === "CATEGORY"
      ? "/api/v1/finance/categories"
      : request.kind === "ACCOUNT"
        ? "/api/v1/finance/accounts"
        : "/api/v1/finance/cost-centers";
  return apiPost<{ data: unknown }>(path, request.input);
}

export function approveFinanceTransaction(id: string, markAsPaid = false) {
  return apiPost<{ data: FinanceTransaction }>(
    `/api/v1/finance/transactions/${id}/approve`,
    markAsPaid ? { mark_as_paid: true, paid_at: new Date().toISOString() } : {},
  );
}

export function reconcileFinanceTransaction(id: string) {
  return apiPost<{ data: FinanceTransaction }>(`/api/v1/finance/transactions/${id}/reconcile`, {});
}
