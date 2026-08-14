import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/persons/components/FormField";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useAssignMemberRole, useRoles } from "../queries";

const today = () => new Date().toISOString().slice(0, 10);

export function MemberRoleDialog({
  open,
  onOpenChange,
  memberId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
}) {
  const [roleId, setRoleId] = useState("");
  const [startsAt, setStartsAt] = useState(today());
  const [endsAt, setEndsAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rolesQuery = useRoles(open);
  const assign = useAssignMemberRole(memberId);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setRoleId("");
    setStartsAt(today());
    setEndsAt("");
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (assign.isPending) return;

    const nextErrors: Record<string, string> = {};
    if (!roleId) nextErrors["role_id"] = "Selecione um papel institucional.";
    if (!startsAt) nextErrors["starts_at"] = "Informe a data de início.";
    if (startsAt && endsAt && endsAt < startsAt) {
      nextErrors["ends_at"] = "O encerramento deve ser posterior ao início.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    try {
      await assign.mutateAsync({
        role_id: roleId,
        starts_at: startsAt,
        ...(endsAt ? { ends_at: endsAt } : {}),
      });
      toast.success("Papel atribuído ao membro.");
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
          <DialogTitle>Atribuir papel</DialogTitle>
          <DialogDescription>
            A atribuição é temporal: o histórico de papéis é preservado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            id="role_id"
            label="Papel institucional"
            error={errors["role_id"]}
            hint={rolesQuery.isError ? apiErrorMessage(rolesQuery.error) : undefined}
          >
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="role_id">
                <SelectValue
                  placeholder={rolesQuery.isLoading ? "Carregando papéis…" : "Selecione um papel"}
                />
              </SelectTrigger>
              <SelectContent>
                {(rolesQuery.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name ?? role.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="role_starts_at" label="Início" error={errors["starts_at"]}>
              <Input
                id="role_starts_at"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </FormField>
            <FormField id="role_ends_at" label="Encerramento (opcional)" error={errors["ends_at"]}>
              <Input
                id="role_ends_at"
                type="date"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={assign.isPending}>
              {assign.isPending ? "Salvando…" : "Atribuir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
