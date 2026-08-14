import { Pencil, Plus, UserRound, UserRoundX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { useSession } from "@/contexts/SessionContext";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useProjectTeam, useRemoveProjectTeamMember } from "../queries";
import {
  isTeamMemberActive,
  teamPersonName,
  teamRoleLabel,
  type ProjectTeamMember,
} from "../types";
import { ProjectTeamFormDialog } from "./ProjectTeamFormDialog";

export function ProjectTeamSection({ projectId }: { projectId: string }) {
  const { can } = useSession();
  const canManage = can("project.manage_team");
  const query = useProjectTeam(projectId);
  const remove = useRemoveProjectTeamMember(projectId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectTeamMember | null>(null);
  const [removing, setRemoving] = useState<ProjectTeamMember | null>(null);

  const team = query.data ?? [];

  async function handleRemove() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      toast.success("Participação encerrada.");
      setRemoving(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <section aria-label="Equipe do projeto" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Equipe do projeto
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pessoas da equipe institucional vinculadas a este projeto e seus períodos de atuação.
          </p>
        </div>
        {canManage ? (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus aria-hidden="true" className="size-4" />
            Incluir membro
          </Button>
        ) : null}
      </header>

      {query.isLoading ? (
        <ListSkeleton rows={3} />
      ) : query.isError ? (
        <ErrorState
          title="Não foi possível carregar a equipe"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : team.length === 0 ? (
        <EmptyState
          title="Nenhum membro vinculado"
          description="Este projeto ainda não possui equipe registrada no sistema institucional."
        />
      ) : (
        <ul className="space-y-3">
          {team.map((entry) => {
            const active = isTeamMemberActive(entry);
            return (
              <li
                key={entry.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <UserRound aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-48 flex-1">
                  <p className="font-medium text-foreground">{teamPersonName(entry)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.starts_at)} —{" "}
                    {entry.ends_at ? formatDate(entry.ends_at) : "em atuação"}
                  </p>
                </div>
                <Badge variant="outline">{teamRoleLabel(entry)}</Badge>
                <Badge variant={active ? "secondary" : "outline"}>
                  {active ? "Ativa" : "Encerrada"}
                </Badge>
                {canManage ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(entry);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRemoving(entry)}>
                      <UserRoundX aria-hidden="true" className="size-4" />
                      Encerrar
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <ProjectTeamFormDialog
        projectId={projectId}
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editing}
      />

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar a participação?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing ? teamPersonName(removing) : "Esta pessoa"} deixará de constar na equipe
              ativa do projeto. O histórico institucional é preservado pelo sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleRemove();
              }}
            >
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
