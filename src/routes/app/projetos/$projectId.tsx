import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionContext";
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";
import { ProjectUnitsSection } from "@/features/projects/components/ProjectUnitsSection";
import { useDeleteProject, useProject } from "@/features/projects/queries";
import { PROJECT_STATUS_LABEL } from "@/features/projects/types";
import { apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/app/projetos/$projectId")({
  component: ProjectDetailPage,
});

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { can } = useSession();
  const query = useProject(projectId);
  const remove = useDeleteProject();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const project = query.data?.project ?? null;

  async function handleDelete() {
    try {
      await remove.mutateAsync(projectId);
      toast.success("Projeto excluído.");
      setConfirmOpen(false);
      void navigate({ to: "/app/projetos" });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !project) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-foreground">Não foi possível carregar o projeto</p>
        <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
        <Button variant="outline" className="mt-5" asChild>
          <Link to="/app/projetos">Voltar para projetos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/app/projetos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Projetos
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project.name}
            </h1>
            <Badge variant="outline">{PROJECT_STATUS_LABEL[String(project.status)] ?? "—"}</Badge>
            {project.has_clinical_care ? (
              <Badge variant="secondary">Atendimento clínico</Badge>
            ) : null}
          </div>
          {project.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          {can("project.update") ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil aria-hidden="true" className="size-4" />
              Editar
            </Button>
          ) : null}
          {can("project.delete") ? (
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Excluir
            </Button>
          ) : null}
        </div>
      </header>

      <section
        aria-label="Dados do projeto"
        className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nome curto
          </p>
          <p className="mt-1 text-sm text-foreground">{project.short_name || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Identificador
          </p>
          <p className="mt-1 text-sm text-foreground">{project.slug || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Início
          </p>
          <p className="mt-1 text-sm text-foreground">{formatDate(project.starts_at)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Término
          </p>
          <p className="mt-1 text-sm text-foreground">{formatDate(project.ends_at)}</p>
        </div>
      </section>

      <ProjectUnitsSection projectId={projectId} embeddedUnits={query.data?.units ?? null} />

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto deixará de aparecer nas listagens. O histórico institucional é preservado
              pelo sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}