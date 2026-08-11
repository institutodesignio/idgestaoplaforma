import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionContext";
import { apiErrorMessage } from "@/lib/api";
import { useProjectUnits, useUnlinkProjectUnit } from "../queries";
import type { ProjectUnit } from "../types";
import { ProjectUnitFormDialog } from "./ProjectUnitFormDialog";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function ProjectUnitsSection({
  projectId,
  embeddedUnits,
}: {
  projectId: string;
  embeddedUnits?: ProjectUnit[] | null;
}) {
  const { can } = useSession();
  const canManage = can("project.manage_team") || can("project.update");
  const query = useProjectUnits(projectId, embeddedUnits);
  const units = embeddedUnits ?? query.data ?? [];
  const unlink = useUnlinkProjectUnit(projectId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectUnit | null>(null);
  const [removing, setRemoving] = useState<ProjectUnit | null>(null);

  async function handleUnlink() {
    if (!removing) return;
    try {
      await unlink.mutateAsync(removing.id);
      toast.success("Vínculo removido.");
      setRemoving(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <section aria-label="Unidades do projeto" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Unidades do Projeto
        </h2>
        {canManage ? (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus aria-hidden="true" className="size-4" />
            Vincular unidade
          </Button>
        ) : null}
      </header>

      {!embeddedUnits && query.isLoading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : !embeddedUnits && query.isError ? (
        <div className="surface-card rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
        </div>
      ) : units.length === 0 ? (
        <div className="surface-card rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-foreground">Nenhuma unidade vinculada</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vincule as unidades onde este projeto acontece.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {units.map((item) => (
            <li key={item.id} className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Building2 aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-48 flex-1">
                <p className="font-medium text-foreground">
                  {item.unit?.name ?? item.unit_name ?? "Unidade"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.starts_at)} — {formatDate(item.ends_at)}
                </p>
              </div>
              {item.is_primary ? <Badge>Principal</Badge> : null}
              {canManage ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(item);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRemoving(item)}>
                    <Trash2 aria-hidden="true" className="size-4" />
                    Remover
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ProjectUnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        projectUnit={editing}
        linkedUnitIds={units.map((item) => item.unit_id)}
      />

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo da unidade?</AlertDialogTitle>
            <AlertDialogDescription>
              A unidade deixará de estar vinculada a este projeto. Você pode vinculá-la novamente
              depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); void handleUnlink(); }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}