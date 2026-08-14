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
import { UnitFormDialog } from "@/features/units/components/UnitFormDialog";
import { useDeleteUnit, useUnit } from "@/features/units/queries";
import { UNIT_STATUS_LABEL } from "@/features/units/types";
import { apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/app/unidades/$unitId")({
  component: UnitDetailPage,
});

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function UnitDetailPage() {
  const { unitId } = Route.useParams();
  const navigate = useNavigate();
  const { can } = useSession();
  const query = useUnit(unitId);
  const remove = useDeleteUnit();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const unit = query.data ?? null;

  async function handleDelete() {
    try {
      await remove.mutateAsync(unitId);
      toast.success("Unidade excluída.");
      setConfirmOpen(false);
      void navigate({ to: "/app/unidades", search: { page: 1, search: "", status: "" } });
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

  if (query.isError || !unit) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-foreground">Não foi possível carregar a unidade</p>
        <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
        <Button variant="outline" className="mt-5" asChild>
          <Link to="/app/unidades" search={{ page: 1, search: "", status: "" }}>
            Voltar para unidades
          </Link>
        </Button>
      </div>
    );
  }

  const address =
    [
      [unit.street, unit.street_number].filter(Boolean).join(", "),
      unit.address_complement,
      unit.neighborhood,
      [unit.city, unit.state_code].filter(Boolean).join(" - "),
      unit.postal_code,
    ]
      .filter(Boolean)
      .join(" • ") || null;

  return (
    <div className="space-y-8">
      <Link
        to="/app/unidades"
        search={{ page: 1, search: "", status: "" }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Unidades
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{unit.name}</h1>
            {unit.is_headquarters ? <Badge>Sede principal</Badge> : null}
            <Badge variant="outline">{UNIT_STATUS_LABEL[String(unit.status)] ?? "—"}</Badge>
          </div>
          {unit.description ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {unit.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          {can("unit.update") ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil aria-hidden="true" className="size-4" />
              Editar
            </Button>
          ) : null}
          {can("unit.delete") ? (
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Excluir
            </Button>
          ) : null}
        </div>
      </header>

      <section
        aria-label="Dados da unidade"
        className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2"
      >
        <Field label="Identificador" value={unit.slug} />
        <Field label="Situação" value={UNIT_STATUS_LABEL[String(unit.status)]} />
        <Field label="E-mail" value={unit.email} />
        <Field label="Telefone" value={unit.phone} />
        <div className="sm:col-span-2">
          <Field label="Endereço" value={address} />
        </div>
      </section>

      <UnitFormDialog open={editOpen} onOpenChange={setEditOpen} unit={unit} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta unidade?</AlertDialogTitle>
            <AlertDialogDescription>
              A unidade deixará de aparecer nas listagens. O histórico institucional é preservado
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
