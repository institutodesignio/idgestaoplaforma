import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
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
import { PersonFormDialog } from "@/features/persons/components/PersonFormDialog";
import { StatusBadge } from "@/features/persons/components/StatusBadge";
import { usePersonsList } from "@/features/persons/queries";
import { PERSON_TYPE_LABEL, type PersonStatus, type PersonType } from "@/features/persons/types";
import { apiErrorMessage } from "@/lib/api";

type PessoasSearch = {
  page: number;
  search: string;
  status: string;
  type: string;
};

export const Route = createFileRoute("/app/pessoas/")({
  validateSearch: (search: Record<string, unknown>): PessoasSearch => ({
    page: Number(search['page']) > 0 ? Number(search['page']) : 1,
    search: typeof search['search'] === "string" ? search['search'] : "",
    status: typeof search['status'] === "string" ? search['status'] : "",
    type: typeof search['type'] === "string" ? search['type'] : "",
  }),
  component: PersonsListPage,
});

const LIMIT = 20;

function PersonsListPage() {
  const { page, search, status, type } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { hasPermission } = useSession();
  const canCreate = hasPermission("person.create");

  const [term, setTerm] = useState(search);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => setTerm(search), [search]);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, search: trimmed, page: 1 }) });
    }, 400);
    return () => clearTimeout(timer);
  }, [term, search, navigate]);

  const query = usePersonsList({ page, limit: LIMIT, search, status, type });
  const persons = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Pessoas</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Gestão de pessoas vinculadas ao Instituto Designio.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Nova pessoa
          </Button>
        ) : null}
      </header>

      <section aria-label="Busca e filtros" className="surface-card rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_11rem]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className="pl-9"
              aria-label="Buscar por nome ou e-mail"
            />
          </div>

          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev) => ({ ...prev, status: value === "ALL" ? "" : value, page: 1 }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por situação">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={type || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev) => ({ ...prev, type: value === "ALL" ? "" : value, page: 1 }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="INDIVIDUAL">Pessoa física</SelectItem>
              <SelectItem value="ORGANIZATION">Organização</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-label="Lista de pessoas" className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar as pessoas
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
            <Button variant="outline" className="mt-5" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : persons.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center">
            <p className="text-sm font-medium text-foreground">Nenhuma pessoa encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste a busca e os filtros ou cadastre uma nova pessoa.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {persons.map((person) => (
              <li key={person.id}>
                <Link
                  to="/app/pessoas/$personId"
                  params={{ personId: person.id }}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-56 flex-1">
                    <p className="font-medium text-foreground">{person.full_name}</p>
                    {person.preferred_name ? (
                      <p className="text-xs text-muted-foreground">
                        Nome preferido: {person.preferred_name}
                      </p>
                    ) : null}
                  </div>
                  <p className="w-32 text-xs text-muted-foreground">
                    {PERSON_TYPE_LABEL[person.person_type as PersonType] ?? "—"}
                  </p>
                  <p className="w-56 truncate text-sm text-muted-foreground">
                    {person.primary_email ?? "—"}
                  </p>
                  <p className="w-36 text-sm text-muted-foreground">
                    {person.primary_phone ?? "—"}
                  </p>
                  <StatusBadge status={person.status as PersonStatus} />
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
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} pessoas
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  void navigate({
                    search: (prev) => ({ ...prev, page: Math.max(1, pagination.page - 1) }),
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
                  void navigate({ search: (prev) => ({ ...prev, page: pagination.page + 1 }) })
                }
              >
                Próxima
              </Button>
            </div>
          </nav>
        ) : null}
      </section>

      <PersonFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(personId) => {
          if (personId) void navigate({ to: "/app/pessoas/$personId", params: { personId } });
        }}
      />
    </div>
  );
}