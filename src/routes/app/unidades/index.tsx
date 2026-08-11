import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionContext";
import { UnitFormDialog } from "@/features/units/components/UnitFormDialog";
import { useUnitsList } from "@/features/units/queries";
import { UNIT_STATUS_LABEL } from "@/features/units/types";
import { apiErrorMessage } from "@/lib/api";

type UnitsSearch = { page: number; search: string; status: string };

export const Route = createFileRoute("/app/unidades/")({
  validateSearch: (search: Record<string, unknown>): UnitsSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    search: typeof search["search"] === "string" ? search["search"] : "",
    status: typeof search["status"] === "string" ? search["status"] : "",
  }),
  component: UnitsListPage,
});

const LIMIT = 20;

function UnitsListPage() {
  const { page, search, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const canCreate = can("unit.create");

  const [term, setTerm] = useState(search);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => setTerm(search), [search]);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      void navigate({ search: (prev: UnitsSearch) => ({ ...prev, search: trimmed, page: 1 }) });
    }, 400);
    return () => clearTimeout(timer);
  }, [term, search, navigate]);

  const query = useUnitsList({ page, limit: LIMIT, search, status });
  const units = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Unidades</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Unidades e espaços de atendimento do Instituto Designio.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Nova unidade
          </Button>
        ) : null}
      </header>

      <section aria-label="Busca e filtros" className="surface-card rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por nome"
              className="pl-9"
              aria-label="Buscar unidade por nome"
            />
          </div>
          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: UnitsSearch) => ({
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
              {Object.entries(UNIT_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-label="Lista de unidades" className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar as unidades
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
            <Button variant="outline" className="mt-5" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : units.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center">
            <p className="text-sm font-medium text-foreground">Nenhuma unidade encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste a busca ou cadastre uma nova unidade.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {units.map((unit) => (
              <li key={unit.id}>
                <Link
                  to="/app/unidades/$unitId"
                  params={{ unitId: unit.id }}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Building2 aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">{unit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[unit.city, unit.state_code].filter(Boolean).join(" • ") || "—"}
                    </p>
                  </div>
                  <p className="w-56 truncate text-sm text-muted-foreground">{unit.email ?? "—"}</p>
                  {unit.is_headquarters ? <Badge>Sede</Badge> : null}
                  <Badge variant={unit.status === "ACTIVE" ? "secondary" : "outline"}>
                    {UNIT_STATUS_LABEL[String(unit.status)] ?? "—"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label="Paginação"
            className="flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <p className="text-xs text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} unidades
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  void navigate({
                    search: (prev: UnitsSearch) => ({
                      ...prev,
                      page: Math.max(1, pagination.page - 1),
                    }),
                  })
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  void navigate({
                    search: (prev: UnitsSearch) => ({ ...prev, page: pagination.page + 1 }),
                  })
                }
              >
                Próxima
              </Button>
            </div>
          </nav>
        ) : null}
      </section>

      <UnitFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(unitId) => {
          if (unitId) void navigate({ to: "/app/unidades/$unitId", params: { unitId } });
        }}
      />
    </div>
  );
}