import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
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
import { useSession } from "@/contexts/SessionContext";
import { PersonName } from "@/features/persons/components/PersonName";
import { useIntakesList } from "@/features/neurodivergent/queries";
import {
  INTAKE_STATUS_LABEL,
  INTAKE_STATUS_OPTIONS,
  intakeProtocol,
} from "@/features/neurodivergent/types";
import { formatDate } from "@/lib/format";

type IntakesSearch = { page: number; status: string; search: string };

export const Route = createFileRoute("/app/cadastro-neurodivergente/")({
  validateSearch: (search: Record<string, unknown>): IntakesSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    status: typeof search["status"] === "string" ? search["status"] : "",
    search: typeof search["search"] === "string" ? search["search"] : "",
  }),
  component: IntakesListPage,
});

const LIMIT = 20;

function IntakesListPage() {
  const { page, status, search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const canManage = can("neurodivergent_profile.manage");

  const [term, setTerm] = useState(search);
  useEffect(() => setTerm(search), [search]);
  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      void navigate({ search: (prev: IntakesSearch) => ({ ...prev, search: trimmed, page: 1 }) });
    }, 400);
    return () => clearTimeout(timer);
  }, [term, search, navigate]);

  const query = useIntakesList({ page, limit: LIMIT, status, search });
  const intakes = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Cadastro da população neurodivergente
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cadastros recebidos com consentimento explícito, território e necessidades declaradas.
          </p>
        </div>
        {canManage ? (
          <Button asChild>
            <Link to="/app/cadastro-neurodivergente/novo">
              <Plus aria-hidden="true" className="size-4" />
              Novo cadastro
            </Link>
          </Button>
        ) : null}
      </header>

      <section aria-label="Busca e filtros" className="surface-card rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por nome ou protocolo"
              className="pl-9"
              aria-label="Buscar cadastro"
            />
          </div>
          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: IntakesSearch) => ({
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
              {INTAKE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-label="Cadastros recebidos" className="space-y-4">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar os cadastros"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : intakes.length === 0 ? (
          <EmptyState
            title="Nenhum cadastro encontrado"
            description="Ajuste a busca e os filtros ou inicie um novo cadastro acolhedor."
          />
        ) : (
          <ul className="space-y-3">
            {intakes.map((intake) => (
              <li key={intake.id}>
                <Link
                  to="/app/cadastro-neurodivergente/$intakeId"
                  params={{ intakeId: intake.id }}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">
                      <PersonName personId={intake.person_id} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Protocolo {intakeProtocol(intake)} •{" "}
                      {formatDate(intake.submitted_at ?? intake.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {INTAKE_STATUS_LABEL[String(intake.status)] ?? intake.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <nav
          aria-label="Paginação"
          className="flex flex-wrap items-center justify-between gap-3 pt-2"
        >
          <p className="text-xs text-muted-foreground">Página {page}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                void navigate({
                  search: (prev: IntakesSearch) => ({ ...prev, page: Math.max(1, page - 1) }),
                })
              }
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={intakes.length < LIMIT}
              onClick={() =>
                void navigate({ search: (prev: IntakesSearch) => ({ ...prev, page: page + 1 }) })
              }
            >
              Próxima
            </Button>
          </div>
        </nav>
      </section>
    </div>
  );
}
