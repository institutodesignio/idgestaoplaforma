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
import { useInviteMember, useRoles } from "../queries";

export function MemberInviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const invite = useInviteMember();
  const rolesQuery = useRoles(open);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) return;
    setEmail("");
    setFullName("");
    setRoleId("");
    setErrors({});
  }, [open]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors["full_name"] = "Informe o nome completo.";
    if (!email.trim()) nextErrors["email"] = "Informe o e-mail institucional.";
    if (!roleId) nextErrors["role_id"] = "Selecione o papel institucional.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await invite.mutateAsync({
        email: email.trim(),
        full_name: fullName.trim(),
        role_id: roleId,
      });
      toast.success("Convite institucional enviado.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const roles = rolesQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar pessoa para a equipe</DialogTitle>
          <DialogDescription>
            A pessoa receberá acesso ao ambiente institucional com o papel escolhido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField id="invite-name" label="Nome completo" error={errors["full_name"]}>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </FormField>
          <FormField id="invite-email" label="E-mail" error={errors["email"]}>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          <FormField id="invite-role" label="Papel institucional" error={errors["role_id"]}>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name ?? role.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={invite.isPending} onClick={() => void handleSubmit()}>
            {invite.isPending ? "Enviando…" : "Enviar convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
