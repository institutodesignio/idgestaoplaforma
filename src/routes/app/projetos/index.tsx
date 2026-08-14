import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FolderKanban, Plus, Search } from "lucide-react";
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
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";
import { useProjectsList } from "@/features/projects/queries";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_OPTIONS } from "@/features/projects/types";
import { apiErrorMessage } from "@/lib/api";

type ProjectsSearch = { page: number; search: string; status: string; clinical: string };

export const Route = createFileRoute("/app/projetos/")({
  validateSearch: (search: Record<string, unknown>): ProjectsSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    search: typeof search["search"] === "string" ? search["search"] : "",
    status: typeof search["status"] === "string" ? search["status"] : "",
    clinical:
      search["clinical"] === "true" || search["clinical"] === "false"
        ? String(search["clinical"])
        : "",
  }),
  component: ProjectsListPage,
});

const LIMIT = 20;

function ProjectsListPage() {
  const { page, search, status, clinical } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();

  const [term, setTerm] = useState(search);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => setTerm(search), [search]);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      void navigate({ search: (prev: ProjectsSearch) => ({ ...prev, search: trimmed, page: 1 }) });
    }, 400);
    return () => clearTimeout(timer);
  }, [term, search, navigate]);

  const query = useProjectsList({
    page,
    limit: LIMIT,
    search,
    status,
    has_clinical_care: clinical === "" ? undefined : clinical === "true",
  });
  const projects = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Projetos</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Projetos institucionais, unidades vinculadas e acompanhamento.
          </p>
        </div>
        {can("project.create") ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Novo projeto
          </Button>
        ) : null}
      </header>

      <section aria-label="Busca e filtros" className="surface-card rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
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
              aria-label="Buscar projeto por nome"
            />
          </div>

          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: ProjectsSearch) => ({
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
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={clinical || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: ProjectsSearch) => ({
                  ...prev,
                  clinical: value === "ALL" ? "" : value,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por atendimento clínico">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Clínico e não clínico</SelectItem>
              <SelectItem value="true">Com atendimento clínico</SelectItem>
              <SelectItem value="false">Sem atendimento clínico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-label="Lista de projetos" className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar os projetos
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
            <Button variant="outline" className="mt-5" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center">
            <p className="text-sm font-medium text-foreground">Nenhum projeto encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste a busca e os filtros ou crie um novo projeto.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to="/app/projetos/$projectId"
                  params={{ projectId: project.id }}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <FolderKanban aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">{project.name}</p>
                    {project.short_name ? (
                      <p className="text-xs text-muted-foreground">{project.short_name}</p>
                    ) : null}
                  </div>
                  {project.has_clinical_care ? (
                    <Badge variant="secondary">Atendimento clínico</Badge>
                  ) : null}
                  <Badge variant="outline">
                    {PROJECT_STATUS_LABEL[String(project.status)] ?? "—"}
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
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} projetos
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  void navigate({
                    search: (prev: ProjectsSearch) => ({
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
                    search: (prev: ProjectsSearch) => ({ ...prev, page: pagination.page + 1 }),
                  })
                }
              >
                Próxima
              </Button>
            </div>
          </nav>
        ) : null}
      </section>

      <ProjectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(projectId) => {
          if (projectId) void navigate({ to: "/app/projetos/$projectId", params: { projectId } });
        }}
      />
    </div>
  );
}
