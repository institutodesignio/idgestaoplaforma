import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Pager } from "@/components/data/Pager";
import { RequirePermission } from "@/components/shell/RequirePermission";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditEvents } from "@/features/audit/queries";
import {
  AUDIT_RESOURCE_OPTIONS,
  auditAction,
  auditActor,
  auditDate,
} from "@/features/audit/types";
import { formatDateTime } from "@/lib/format";

type AuditSearch = { page: number; resource: string };

export const Route = createFileRoute("/app/auditoria")({
  validateSearch: (search: Record<string, unknown>): AuditSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    resource: typeof search["resource"] === "string" ? search["resource"] : "",
  }),
  component: () => (
    <RequirePermission permission="audit.read">
      <AuditPage />
    </RequirePermission>
  ),
});

const LIMIT = 25;

function AuditPage() {
  const { page, resource } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useAuditEvents({ page, limit: LIMIT, resource_type: resource });
  const events = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Módulo
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Trilha de auditoria
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Registro institucional de ações realizadas no sistema, sem conteúdo sensível.
        </p>
      </header>

      <section aria-label="Filtros" className="surface-card rounded-2xl p-4">
        <Select
          value={resource || "ALL"}
          onValueChange={(value) =>
            void navigate({
              search: (prev: AuditSearch) => ({
                ...prev,
                resource: value === "ALL" ? "" : value,
                page: 1,
              }),
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por recurso" className="sm:max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os recursos</SelectItem>
            {AUDIT_RESOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section aria-label="Eventos de auditoria" className="space-y-4">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar a auditoria"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : events.length === 0 ? (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Ajuste o filtro de recurso para ver outros registros."
          />
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <ScrollText aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-48 flex-1">
                  <p className="font-medium text-foreground">{auditAction(event)}</p>
                  <p className="text-xs text-muted-foreground">
                    {auditActor(event)} • {event.resource_type ?? "recurso"} •{" "}
                    {formatDateTime(auditDate(event))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Pager
          pagination={query.data?.pagination}
          unitLabel="eventos"
          onChange={(next) =>
            void navigate({ search: (prev: AuditSearch) => ({ ...prev, page: next }) })
          }
        />
      </section>
    </div>
  );
}