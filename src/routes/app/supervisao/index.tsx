import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Stethoscope } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/contexts/SessionContext";
import { SupervisionCaseDialog } from "@/features/clinical-supervision/components/SupervisionCaseDialog";
import { useSupervisionCases } from "@/features/clinical-supervision/queries";
import {
  SUPERVISION_CASE_STATUS_LABEL,
  SUPERVISION_CASE_STATUS_OPTIONS,
  SUPERVISION_PRIORITY_LABEL,
} from "@/features/clinical-supervision/types";
import { PersonName } from "@/features/persons/components/PersonName";
import { formatDate } from "@/lib/format";

type SupervisionSearch = { page: number; status: string };

export const Route = createFileRoute("/app/supervisao/")({
  validateSearch: (search: Record<string, unknown>): SupervisionSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    status: typeof search["status"] === "string" ? search["status"] : "",
  }),
  component: SupervisionCasesPage,
});

const LIMIT = 20;

function SupervisionCasesPage() {
  const { page, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const canManage = can("clinical_supervision.manage");
  const [createOpen, setCreateOpen] = useState(false);

  const query = useSupervisionCases({ page, limit: LIMIT, status });
  const cases = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Central de Supervisão Clínica
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Casos em supervisão, sessões e Responsável Técnico de cada acompanhamento.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Abrir caso
          </Button>
        ) : null}
      </header>

      <section aria-label="Filtros" className="surface-card rounded-2xl p-4">
        <Select
          value={status || "ALL"}
          onValueChange={(value) =>
            void navigate({
              search: (prev: SupervisionSearch) => ({
                ...prev,
                status: value === "ALL" ? "" : value,
                page: 1,
              }),
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por situação" className="sm:max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as situações</SelectItem>
            {SUPERVISION_CASE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section aria-label="Casos em supervisão" className="space-y-4">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar os casos"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : cases.length === 0 ? (
          <EmptyState
            title="Nenhum caso encontrado"
            description="Ajuste o filtro de situação ou abra um novo caso de supervisão."
          />
        ) : (
          <ul className="space-y-3">
            {cases.map((item) => (
              <li key={item.id}>
                <Link
                  to="/app/supervisao/$caseId"
                  params={{ caseId: item.id }}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Stethoscope aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">
                      <PersonName
                        personId={item.beneficiary_person_id}
                        fallback="Pessoa acompanhada"
                      />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      RT:{" "}
                      <PersonName
                        personId={item.assigned_technical_person_id}
                        fallback="Responsável Técnico não definido"
                      />{" "}
                      • aberto em {formatDate(item.opened_at)}
                    </p>
                  </div>
                  {item.priority ? (
                    <Badge variant="secondary">
                      {SUPERVISION_PRIORITY_LABEL[String(item.priority)] ?? item.priority}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    {SUPERVISION_CASE_STATUS_LABEL[String(item.status)] ?? item.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {cases.length > 0 ? (
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Página {page} • {cases.length} caso(s) nesta página
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  void navigate({
                    search: (prev: SupervisionSearch) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }),
                  })
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={cases.length < LIMIT}
                onClick={() =>
                  void navigate({
                    search: (prev: SupervisionSearch) => ({ ...prev, page: prev.page + 1 }),
                  })
                }
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <SupervisionCaseDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(caseId) => void navigate({ to: "/app/supervisao/$caseId", params: { caseId } })}
      />
    </div>
  );
}
