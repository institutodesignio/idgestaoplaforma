import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownCircle, ArrowUpCircle, Plus, Settings2, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/SessionContext";
import {
  useApproveFinanceTransaction,
  useCreateFinanceTransaction,
  useCreateFinanceSetupItem,
  useFinanceSetup,
  useFinanceSummary,
  useFinanceTransactions,
  useReconcileFinanceTransaction,
} from "@/features/finance/queries";
import {
  moneyBRL,
  TRANSACTION_STATUS_LABEL,
  TRANSACTION_TYPE_LABEL,
  type FinanceTransaction,
  type TransactionType,
} from "@/features/finance/types";
import { apiErrorMessage } from "@/lib/api";
import { formatDate, todayInput } from "@/lib/format";

type FinanceSearch = { from: string; to: string; type: string; status: string };
function firstDay() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export const Route = createFileRoute("/app/financeiro")({
  validateSearch: (search: Record<string, unknown>): FinanceSearch => ({
    from: typeof search["from"] === "string" ? search["from"] : firstDay(),
    to: typeof search["to"] === "string" ? search["to"] : todayInput(),
    type: typeof search["type"] === "string" ? search["type"] : "",
    status: typeof search["status"] === "string" ? search["status"] : "",
  }),
  component: () => (
    <RequirePermission permission="finance.read">
      <FinancePage />
    </RequirePermission>
  ),
});

function FinancePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [selected, setSelected] = useState<FinanceTransaction | null>(null);
  const setup = useFinanceSetup(new Date().getFullYear());
  const query = useFinanceTransactions(search);
  const summary = useFinanceSummary(search.from, search.to);
  const rows = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const totals = useMemo(
    () =>
      rows.reduce(
        (result, row) => {
          if (row.status !== "CANCELLED")
            result[row.transaction_type === "INCOME" ? "income" : "expense"] += Number(row.amount);
          return result;
        },
        { income: 0, expense: 0 },
      ),
    [rows],
  );
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Receitas, despesas, aprovações e conciliação com trilha institucional.
          </p>
        </div>
        {can("finance.create") ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSetupOpen(true)}>
              <Settings2 className="size-4" aria-hidden="true" />
              Configurar
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Novo lançamento
            </Button>
          </div>
        ) : null}
      </header>

      <section aria-label="Resumo financeiro" className="grid gap-3 sm:grid-cols-3">
        <MoneyMetric label="Receitas no filtro" value={totals.income} tone="income" />
        <MoneyMetric label="Despesas no filtro" value={totals.expense} tone="expense" />
        <MoneyMetric label="Saldo do filtro" value={totals.income - totals.expense} />
        <span className="sr-only" aria-live="polite">
          {summary.isLoading
            ? "Carregando resumo financeiro oficial"
            : summary.isError
              ? "Resumo oficial indisponível"
              : "Resumo oficial atualizado"}
        </span>
      </section>

      <section
        aria-label="Filtros financeiros"
        className="surface-card grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="space-y-1 text-xs font-medium">
          De
          <Input
            type="date"
            value={search.from}
            onChange={(event) =>
              void navigate({
                search: (prev: FinanceSearch) => ({ ...prev, from: event.target.value }),
              })
            }
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Até
          <Input
            type="date"
            value={search.to}
            onChange={(event) =>
              void navigate({
                search: (prev: FinanceSearch) => ({ ...prev, to: event.target.value }),
              })
            }
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Tipo
          <Select
            value={search.type || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: FinanceSearch) => ({ ...prev, type: value === "ALL" ? "" : value }),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1 text-xs font-medium">
          Situação
          <Select
            value={search.status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: FinanceSearch) => ({
                  ...prev,
                  status: value === "ALL" ? "" : value,
                }),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {Object.entries(TRANSACTION_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </section>

      <section aria-label="Lançamentos financeiros">
        {query.isLoading || setup.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar os lançamentos"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : setup.isError ? (
          <ErrorState
            title="Não foi possível carregar a configuração financeira"
            error={setup.error}
            onRetry={() => void setup.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento encontrado"
            description={
              setup.data?.data.categories.length
                ? "Ajuste os filtros ou crie um novo lançamento."
                : "Cadastre categorias financeiras antes de registrar lançamentos."
            }
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  {row.transaction_type === "INCOME" ? (
                    <ArrowUpCircle className="size-5 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <ArrowDownCircle className="size-5 text-rose-700" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-52 flex-1">
                  <p className="font-medium">{row.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(row.competence_date)} •{" "}
                    {TRANSACTION_TYPE_LABEL[row.transaction_type] ?? row.transaction_type}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{moneyBRL(row.amount)}</p>
                <Badge variant="outline">
                  {TRANSACTION_STATUS_LABEL[row.status] ?? row.status}
                </Badge>
                {(can("finance.approve") || can("finance.reconcile")) &&
                row.status !== "CANCELLED" ? (
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                    Ações
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <FinanceCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <FinanceSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      <FinanceActionsDialog
        transaction={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function FinanceSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useCreateFinanceSetupItem();
  const [kind, setKind] = useState<"CATEGORY" | "ACCOUNT" | "COST_CENTER">("CATEGORY");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<"INCOME" | "EXPENSE" | "BOTH">("BOTH");
  const [accountType, setAccountType] = useState<"BANK" | "CASH" | "DIGITAL_WALLET" | "OTHER">(
    "BANK",
  );
  const [institution, setInstitution] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setKind("CATEGORY");
      setCode("");
      setName("");
      setCategoryType("BOTH");
      setAccountType("BANK");
      setInstitution("");
      setOpeningBalance("0");
      setError("");
    }
  }, [open]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Informe código e nome.");
      return;
    }
    const request =
      kind === "CATEGORY"
        ? ({
            kind,
            input: { code: code.trim(), name: name.trim(), category_type: categoryType },
          } as const)
        : kind === "COST_CENTER"
          ? ({ kind, input: { code: code.trim(), name: name.trim() } } as const)
          : ({
              kind,
              input: {
                code: code.trim(),
                name: name.trim(),
                account_type: accountType,
                institution_name: institution.trim() || null,
                opening_balance: Number(openingBalance.replace(",", ".")) || 0,
              },
            } as const);
    try {
      await save.mutateAsync(request);
      toast.success("Configuração financeira criada.");
      onOpenChange(false);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuração financeira</DialogTitle>
          <DialogDescription>
            Cadastre categorias, contas ou centros de custo antes dos lançamentos.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <label className="space-y-2 text-sm font-medium">
            Item
            <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CATEGORY">Categoria</SelectItem>
                <SelectItem value="ACCOUNT">Conta</SelectItem>
                <SelectItem value="COST_CENTER">Centro de custo</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Código
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                maxLength={80}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Nome
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={200}
              />
            </label>
          </div>
          {kind === "CATEGORY" ? (
            <label className="space-y-2 text-sm font-medium">
              Aplicação
              <Select
                value={categoryType}
                onValueChange={(value) => setCategoryType(value as typeof categoryType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOTH">Receitas e despesas</SelectItem>
                  <SelectItem value="INCOME">Somente receitas</SelectItem>
                  <SelectItem value="EXPENSE">Somente despesas</SelectItem>
                </SelectContent>
              </Select>
            </label>
          ) : null}
          {kind === "ACCOUNT" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                Tipo de conta
                <Select
                  value={accountType}
                  onValueChange={(value) => setAccountType(value as typeof accountType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bancária</SelectItem>
                    <SelectItem value="CASH">Caixa</SelectItem>
                    <SelectItem value="DIGITAL_WALLET">Carteira digital</SelectItem>
                    <SelectItem value="OTHER">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Instituição
                <Input
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  maxLength={160}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Saldo de abertura
                <Input
                  inputMode="decimal"
                  value={openingBalance}
                  onChange={(event) => setOpeningBalance(event.target.value)}
                />
              </label>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Salvar configuração
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MoneyMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "income" | "expense";
}) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${tone === "income" ? "text-emerald-700" : tone === "expense" ? "text-rose-700" : ""}`}
      >
        {moneyBRL(value)}
      </p>
    </div>
  );
}

function FinanceCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setup = useFinanceSetup(new Date().getFullYear());
  const save = useCreateFinanceTransaction();
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInput());
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PENDING_APPROVAL">("DRAFT");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setType("EXPENSE");
      setCategoryId("");
      setAccountId("");
      setCostCenterId("");
      setDescription("");
      setAmount("");
      setDate(todayInput());
      setDueDate("");
      setStatus("DRAFT");
      setError("");
    }
  }, [open]);
  const categories = (setup.data?.data.categories ?? []).filter(
    (item) => item.category_type === "BOTH" || item.category_type === type,
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (
      !categoryId ||
      !description.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !date
    ) {
      setError("Informe categoria, descrição, valor positivo e data de competência.");
      return;
    }
    try {
      await save.mutateAsync({
        transaction_type: type,
        category_id: categoryId,
        account_id: accountId || null,
        cost_center_id: costCenterId || null,
        description: description.trim(),
        amount: numericAmount,
        currency: "BRL",
        competence_date: date,
        due_date: dueDate || null,
        status,
      });
      toast.success("Lançamento criado.");
      onOpenChange(false);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
          <DialogDescription>
            Registre valores financeiros sem dados bancários completos ou informações
            desnecessárias.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Tipo
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as TransactionType);
                  setCategoryId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Categoria
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} — {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Conta
              <Select
                value={accountId || "NONE"}
                onValueChange={(value) => setAccountId(value === "NONE" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Não informada</SelectItem>
                  {setup.data?.data.accounts.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} — {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Centro de custo
              <Select
                value={costCenterId || "NONE"}
                onValueChange={(value) => setCostCenterId(value === "NONE" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Não informado</SelectItem>
                  {setup.data?.data.cost_centers.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} — {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Valor em reais
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Competência
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Vencimento opcional
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Situação inicial
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "DRAFT" | "PENDING_APPROVAL")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Enviar para aprovação</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            Descrição
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || setup.isLoading}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FinanceActionsDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: FinanceTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { can } = useSession();
  const approve = useApproveFinanceTransaction();
  const reconcile = useReconcileFinanceTransaction();
  async function handleApprove(paid: boolean) {
    if (!transaction) return;
    try {
      await approve.mutateAsync({ id: transaction.id, paid });
      toast.success(paid ? "Lançamento aprovado e marcado como pago." : "Lançamento aprovado.");
      onOpenChange(false);
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  async function handleReconcile() {
    if (!transaction) return;
    try {
      await reconcile.mutateAsync(transaction.id);
      toast.success("Lançamento conciliado.");
      onOpenChange(false);
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ações financeiras</DialogTitle>
          <DialogDescription>
            {transaction ? `${transaction.description} • ${moneyBRL(transaction.amount)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-secondary p-3 text-sm">
            <p>
              Situação:{" "}
              <strong>
                {transaction
                  ? (TRANSACTION_STATUS_LABEL[transaction.status] ?? transaction.status)
                  : "—"}
              </strong>
            </p>
            <p>
              Conciliação:{" "}
              <strong>
                {transaction?.reconciliation_status === "RECONCILED"
                  ? "Conciliada"
                  : "Não conciliada"}
              </strong>
            </p>
          </div>
          {can("finance.approve") &&
          transaction &&
          ["DRAFT", "PENDING_APPROVAL"].includes(transaction.status) ? (
            <>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => void handleApprove(false)}
                disabled={approve.isPending}
              >
                Aprovar
              </Button>
              <Button
                className="w-full"
                onClick={() => void handleApprove(true)}
                disabled={approve.isPending}
              >
                Aprovar e marcar como paga
              </Button>
            </>
          ) : null}
          {can("finance.reconcile") &&
          transaction?.status === "PAID" &&
          transaction.reconciliation_status !== "RECONCILED" ? (
            <Button
              className="w-full"
              onClick={() => void handleReconcile()}
              disabled={reconcile.isPending}
            >
              Conciliar lançamento
            </Button>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
