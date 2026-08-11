import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembersList } from "@/features/members/queries";
import {
  MEMBER_STATUS_LABEL,
  TECHNICAL_RESPONSIBLE_CODE,
  isRoleActive,
  memberDisplayName,
  memberEmail,
  memberJoinedAt,
  roleCode,
  roleLabel,
} from "@/features/members/types";
import { apiErrorMessage } from "@/lib/api";

type TeamSearch = { page: number; search: string };

export const Route = createFileRoute("/app/equipe/")({
  validateSearch: (search: Record<string, unknown>): TeamSearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    search: typeof search["search"] === "string" ? search["search"] : "",
  }),
  component: TeamListPage,
});

const LIMIT = 20;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function TeamListPage() {
  const { page, search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState(search);

  useEffect(() => setTerm(search), [search]);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      void navigate({ search: (prev: TeamSearch) => ({ ...prev, search: trimmed, page: 1 }) });
    }, 400);
    return () => clearTimeout(timer);
  }, [term, search, navigate]);

  const query = useMembersList({ page, limit: LIMIT, search });
  const members = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Módulo
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Equipe</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Membros da equipe institucional, vínculos e papéis atuais.
        </p>
      </header>

      <section aria-label="Busca" className="surface-card rounded-2xl p-4">
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
            aria-label="Buscar membro"
          />
        </div>
      </section>

      <section aria-label="Lista de membros" className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar a equipe
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
            <Button variant="outline" className="mt-5" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : members.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center">
            <p className="text-sm font-medium text-foreground">Nenhum membro encontrado</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => {
              const activeRoles = (member.roles ?? []).filter(isRoleActive);
              return (
                <li key={member.id}>
                  <Link
                    to="/app/equipe/$memberId"
                    params={{ memberId: member.id }}
                    className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <Users aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-48 flex-1">
                      <p className="font-medium text-foreground">{memberDisplayName(member)}</p>
                      <p className="text-xs text-muted-foreground">{memberEmail(member) ?? "—"}</p>
                    </div>
                    <p className="w-36 text-xs text-muted-foreground">
                      Entrada: {formatDate(memberJoinedAt(member))}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeRoles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sem papel ativo</span>
                      ) : (
                        activeRoles.map((role) => (
                          <Badge
                            key={role.id}
                            variant={
                              roleCode(role) === TECHNICAL_RESPONSIBLE_CODE ? "default" : "secondary"
                            }
                          >
                            {roleLabel(role)}
                          </Badge>
                        ))
                      )}
                    </div>
                    <Badge variant="outline">
                      {MEMBER_STATUS_LABEL[String(member.status)] ?? member.status ?? "—"}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label="Paginação"
            className="flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <p className="text-xs text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} membros
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  void navigate({
                    search: (prev: TeamSearch) => ({
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
                    search: (prev: TeamSearch) => ({ ...prev, page: pagination.page + 1 }),
                  })
                }
              >
                Próxima
              </Button>
            </div>
          </nav>
        ) : null}
      </section>
    </div>
  );
}