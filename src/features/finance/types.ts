export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PAID" | "CANCELLED";

export type FinanceAccount = {
  id: string;
  code: string;
  name: string;
  account_type: string;
  current_balance?: number | null;
};
export type FinanceCategory = { id: string; code: string; name: string; category_type: string };
export type FinanceCostCenter = {
  id: string;
  code: string;
  name: string;
  project_id?: string | null;
};
export type FinanceBudgetLine = {
  id: string;
  fiscal_year: number;
  planned_amount: number;
  category_id: string;
};

export type FinanceSetup = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  cost_centers: FinanceCostCenter[];
  budget_lines: FinanceBudgetLine[];
};

export type FinanceTransaction = {
  id: string;
  account_id?: string | null;
  category_id: string;
  cost_center_id?: string | null;
  project_id?: string | null;
  transaction_type: TransactionType | string;
  status: TransactionStatus | string;
  description: string;
  amount: number;
  currency?: string | null;
  competence_date: string;
  due_date?: string | null;
  funding_source?: string | null;
  reconciliation_status?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

export type FinanceTransactionInput = {
  account_id?: string | null;
  category_id: string;
  cost_center_id?: string | null;
  transaction_type: TransactionType;
  status?: "DRAFT" | "PENDING_APPROVAL";
  description: string;
  amount: number;
  currency?: string;
  competence_date: string;
  due_date?: string | null;
  funding_source?:
    "OWN_FUNDS" | "DONATION" | "PUBLIC_GRANT" | "PRIVATE_GRANT" | "PARTNERSHIP" | "OTHER";
};

export type FinanceSetupCreate =
  | {
      kind: "CATEGORY";
      input: { code: string; name: string; category_type: "INCOME" | "EXPENSE" | "BOTH" };
    }
  | {
      kind: "ACCOUNT";
      input: {
        code: string;
        name: string;
        account_type: "BANK" | "CASH" | "DIGITAL_WALLET" | "OTHER";
        institution_name?: string | null;
        opening_balance?: number;
      };
    }
  | { kind: "COST_CENTER"; input: { code: string; name: string } };

export type FinanceSummary = Record<string, unknown>;

export const TRANSACTION_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Aguardando aprovação",
  APPROVED: "Aprovada",
  PAID: "Paga",
  CANCELLED: "Cancelada",
};

export const TRANSACTION_TYPE_LABEL: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export function moneyBRL(value: number | string | null | undefined) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}

export function summaryNumber(summary: FinanceSummary | undefined, keys: string[]): number {
  if (!summary) return 0;
  for (const key of keys) {
    const value = summary[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}
