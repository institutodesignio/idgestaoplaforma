import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/persons/components/FormField";
import { useUnitsList } from "@/features/units/queries";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useSaveProjectUnit } from "../queries";
import type { ProjectUnit, ProjectUnitInput } from "../types";

export function ProjectUnitFormDialog({
  open,
  onOpenChange,
  projectId,
  projectUnit,
  linkedUnitIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectUnit?: ProjectUnit | null;
  linkedUnitIds: string[];
}) {
  const [unitId, setUnitId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveProjectUnit(projectId);
  const unitsQuery = useUnitsList({ page: 1, limit: 100, status: "ACTIVE" }, open);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setUnitId(projectUnit?.unit_id ?? "");
    setStartsAt(projectUnit?.starts_at ? projectUnit.starts_at.slice(0, 10) : "");
    setEndsAt(projectUnit?.ends_at ? projectUnit.ends_at.slice(0, 10) : "");
    setIsPrimary(Boolean(projectUnit?.is_primary));
  }, [open, projectUnit]);

  const availableUnits = (unitsQuery.data?.data ?? []).filter(
    (unit) => unit.id === projectUnit?.unit_id || !linkedUnitIds.includes(unit.id),
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;

    const nextErrors: Record<string, string> = {};
    if (!projectUnit && !unitId) nextErrors["unit_id"] = "Selecione a unidade.";
    if (startsAt && endsAt && endsAt < startsAt) {
      nextErrors["ends_at"] = "O término deve ser posterior ao início.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const input: ProjectUnitInput = {
      unit_id: unitId,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      is_primary: isPrimary,
    };

    try {
      await save.mutateAsync(
        projectUnit ? { projectUnitId: projectUnit.id, input } : { input },
      );
      toast.success(projectUnit ? "Vínculo atualizado." : "Unidade vinculada ao projeto.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{projectUnit ? "Editar vínculo" : "Vincular unidade"}</DialogTitle>
          <DialogDescription>
            Uma unidade só pode ser vinculada uma vez e apenas uma pode ser a principal do projeto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField id="unit_id" label="Unidade" error={errors["unit_id"]}>
            <Select value={unitId} onValueChange={setUnitId} disabled={Boolean(projectUnit)}>
              <SelectTrigger id="unit_id">
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="pu_starts_at" label="Início" error={errors["starts_at"]}>
              <Input
                id="pu_starts_at"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </FormField>
            <FormField id="pu_ends_at" label="Término" error={errors["ends_at"]}>
              <Input
                id="pu_ends_at"
                type="date"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </FormField>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="is_primary_unit"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked === true)}
            />
            <Label htmlFor="is_primary_unit" className="text-sm font-normal text-muted-foreground">
              Unidade principal deste projeto.
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}