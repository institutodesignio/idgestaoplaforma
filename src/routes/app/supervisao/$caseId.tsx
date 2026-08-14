import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarPlus, Pencil } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { SupervisionCaseDialog } from "@/features/clinical-supervision/components/SupervisionCaseDialog";
import { SupervisionSessionDialog } from "@/features/clinical-supervision/components/SupervisionSessionDialog";
import {
  useSupervisionCase,
  useSupervisionSessions,
} from "@/features/clinical-supervision/queries";
import {
  SUPERVISION_CASE_STATUS_LABEL,
  SUPERVISION_MODALITY_LABEL,
  SUPERVISION_SESSION_STATUS_LABEL,
  casePersonName,
  caseTechnicalResponsible,
  type SupervisionSession,
} from "@/features/clinical-supervision/types";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/app/supervisao/$caseId")({
  component: SupervisionCaseDetailPage,
});

function SupervisionCaseDetailPage() {
  const { caseId } = Route.useParams();
  const { can } = useSession();
  const canManage = can("clinical_supervision.manage");

  const caseQuery = useSupervisionCase(caseId);
  const embedded = caseQuery.data?.sessions ?? null;
  const sessionsQuery = useSupervisionSessions(caseId, embedded === null);

  const [editOpen, setEditOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SupervisionSession | null>(null);

  const supervisionCase = caseQuery.data?.case ?? null;
  const sessions = embedded ?? sessionsQuery.data ?? [];

  if (caseQuery.isLoading) return <ListSkeleton rows={4} />;

  if (caseQuery.isError || !supervisionCase) {
    return (
      <ErrorState
        title="Não foi possível carregar o caso"
        error={caseQuery.error}
        onRetry={() => void caseQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/app/supervisao"
        search={{ page: 1, status: "" }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Supervisão clínica
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {casePersonName(supervisionCase)}
            </h1>
            <Badge variant="outline">
              {SUPERVISION_CASE_STATUS_LABEL[String(supervisionCase.status)] ??
                supervisionCase.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {caseTechnicalResponsible(supervisionCase)} • aberto em{" "}
            {formatDate(supervisionCase.opened_at)}
          </p>
        </div>
        {canManage ? (
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" className="size-4" />
            Atualizar caso
          </Button>
        ) : null}
      </header>

      <section aria-label="Dados do caso" className="surface-card space-y-4 rounded-2xl p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Projeto
            </p>
            <p className="mt-1 text-sm text-foreground">
              {supervisionCase.project?.name ?? "Não vinculado"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Encerramento
            </p>
            <p className="mt-1 text-sm text-foreground">{formatDate(supervisionCase.closed_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sessões registradas
            </p>
            <p className="mt-1 text-sm text-foreground">{sessions.length}</p>
          </div>
        </div>
        {supervisionCase.summary ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resumo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {supervisionCase.summary}
            </p>
          </div>
        ) : null}
      </section>

      <section aria-label="Sessões de supervisão" className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Sessões</h2>
          {canManage ? (
            <Button
              onClick={() => {
                setEditingSession(null);
                setSessionOpen(true);
              }}
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
              Nova sessão
            </Button>
          ) : null}
        </header>

        {sessionsQuery.isLoading && embedded === null ? (
          <ListSkeleton rows={3} />
        ) : sessionsQuery.isError && embedded === null ? (
          <ErrorState
            title="Não foi possível carregar as sessões"
            error={sessionsQuery.error}
            onRetry={() => void sessionsQuery.refetch()}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            title="Nenhuma sessão registrada"
            description="As sessões de supervisão aparecerão aqui conforme forem registradas."
          />
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li key={session.id} className="surface-card space-y-3 rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="flex-1 font-medium text-foreground">
                    {formatDateTime(session.scheduled_at)}
                  </p>
                  {session.modality ? (
                    <Badge variant="secondary">
                      {SUPERVISION_MODALITY_LABEL[session.modality] ?? session.modality}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    {SUPERVISION_SESSION_STATUS_LABEL[String(session.status)] ?? session.status}
                  </Badge>
                  {canManage ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSession(session);
                        setSessionOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  ) : null}
                </div>
                {session.agenda ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{session.agenda}</p>
                ) : null}
                {session.deliberations ? (
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-medium">Deliberações: </span>
                    {session.deliberations}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <SupervisionCaseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        supervisionCase={supervisionCase}
      />
      <SupervisionSessionDialog
        caseId={caseId}
        open={sessionOpen}
        onOpenChange={setSessionOpen}
        session={editingSession}
      />
    </div>
  );
}
