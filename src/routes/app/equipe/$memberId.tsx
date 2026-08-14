import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionContext";
import { MemberRoleDialog } from "@/features/members/components/MemberRoleDialog";
import { useMember } from "@/features/members/queries";
import {
  MEMBER_STATUS_LABEL,
  isRoleActive,
  memberDisplayName,
  memberEmail,
  memberJoinedAt,
  roleLabel,
} from "@/features/members/types";
import { apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/app/equipe/$memberId")({
  component: MemberDetailPage,
});

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function MemberDetailPage() {
  const { memberId } = Route.useParams();
  const { can } = useSession();
  const query = useMember(memberId);
  const [roleOpen, setRoleOpen] = useState(false);

  const member = query.data?.member ?? null;

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !member) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-foreground">Não foi possível carregar o membro</p>
        <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
        <Button variant="outline" className="mt-5" asChild>
          <Link to="/app/equipe" search={{ page: 1, search: "" }}>
            Voltar para a equipe
          </Link>
        </Button>
      </div>
    );
  }

  const roles = query.data?.roles ?? member.roles ?? [];

  return (
    <div className="space-y-8">
      <Link
        to="/app/equipe"
        search={{ page: 1, search: "" }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Equipe
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {memberDisplayName(member)}
            </h1>
            <Badge variant="outline">
              {MEMBER_STATUS_LABEL[String(member.status)] ?? member.status ?? "—"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{memberEmail(member) ?? "—"}</p>
        </div>
        {can("membership.manage") || can("role.manage") ? (
          <Button onClick={() => setRoleOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Atribuir papel
          </Button>
        ) : null}
      </header>

      <section aria-label="Dados do vínculo" className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Entrada na equipe
          </p>
          <p className="mt-1 text-sm text-foreground">{formatDate(memberJoinedAt(member))}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Papéis ativos
          </p>
          <p className="mt-1 text-sm text-foreground">{roles.filter(isRoleActive).length}</p>
        </div>
      </section>

      <section aria-label="Histórico de papéis" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Histórico de papéis
        </h2>
        {roles.length === 0 ? (
          <div className="surface-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Nenhum papel registrado para este membro.
          </div>
        ) : (
          <ul className="space-y-3">
            {roles.map((role) => (
              <li
                key={role.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <p className="min-w-40 flex-1 font-medium text-foreground">{roleLabel(role)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(role.starts_at)} — {role.ends_at ? formatDate(role.ends_at) : "atual"}
                </p>
                <Badge variant={isRoleActive(role) ? "secondary" : "outline"}>
                  {isRoleActive(role) ? "Ativo" : "Encerrado"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MemberRoleDialog open={roleOpen} onOpenChange={setRoleOpen} memberId={memberId} />
    </div>
  );
}