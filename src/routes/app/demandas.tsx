import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeartHandshake, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Pager } from "@/components/data/Pager";
import { RequirePermission } from "@/components/shell/RequirePermission";
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
import { CareRequestFormDialog } from "@/features/care-requests/components/CareRequestFormDialog";
import { CareRequestUpdateDialog } from "@/features/care-requests/components/CareRequestUpdateDialog";
import { useCareRequestsList } from "@/features/care-requests/queries";
import {
  CARE_REQUEST_PRIORITY_LABEL,
  CARE_REQUEST_PRIORITY_OPTIONS,
  CARE_REQUEST_STATUS_LABEL,
  CARE_REQUEST_STATUS_OPTIONS,
  careRequestPersonName,
  waitingDays,
  type CareRequest,
} from "@/features/care-requests/types";

type DemandasSearch = { page: number; status: string; priority: string };

export const Route = createFileRoute("/app/demandas")({
  validateSearch: (search: Record<string, unknown>): DemandasSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    status: typeof search["status"] === "string" ? search["status"] : "",
    priority: typeof search["priority"] === "string" ? search["priority"] : "",
  }),
  component: () => (
    <RequirePermission anyPermission={["care_request.read", "care_request.manage"]}>
      <CareRequestsPage />
    </RequirePermission>
  ),
});

const LIMIT = 20;

function CareRequestsPage() {
  const { page, status, priority } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const canManage = can("care_request.manage");

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<CareRequest | null>(null);

  const query = useCareRequestsList({ page, limit: LIMIT, status, priority });
  const requests = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Demandas e encaminhamentos
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Solicitações de cuidado, tempo de espera e encaminhamentos institucionais.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Nova demanda
          </Button>
        ) : null}
      </header>

      <section aria-label="Filtros" className="surface-card rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: DemandasSearch) => ({
                  ...prev,
                  status: value === "ALL" ? "" : value,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por situação">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as situações</SelectItem>
              {CARE_REQUEST_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priority || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: DemandasSearch) => ({
                  ...prev,
                  priority: value === "ALL" ? "" : value,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por prioridade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as prioridades</SelectItem>
              {CARE_REQUEST_PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-label="Lista de demandas" className="space-y-4">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar as demandas"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="Nenhuma demanda encontrada"
            description="Ajuste os filtros ou registre uma nova demanda de cuidado."
          />
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => {
              const days = waitingDays(request);
              return (
                <li
                  key={request.id}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <HeartHandshake aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">{careRequestPersonName(request)}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.requested_service ?? "Serviço não informado"}
                      {days !== null ? ` • ${days} dia(s) de espera` : ""}
                    </p>
                  </div>
                  {request.priority ? (
                    <Badge variant="secondary">
                      {CARE_REQUEST_PRIORITY_LABEL[String(request.priority)] ?? request.priority}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    {CARE_REQUEST_STATUS_LABEL[String(request.status)] ?? request.status}
                  </Badge>
                  {canManage ? (
                    <Button variant="outline" size="sm" onClick={() => setSelected(request)}>
                      Atualizar
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <Pager
          pagination={query.data?.pagination}
          unitLabel="demandas"
          onChange={(next) =>
            void navigate({ search: (prev: DemandasSearch) => ({ ...prev, page: next }) })
          }
        />
      </section>

      <CareRequestFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CareRequestUpdateDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
