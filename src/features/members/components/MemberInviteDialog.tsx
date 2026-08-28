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
import type { MemberType } from "../types";

const INSTITUTIONAL_DOMAIN = "@institutodesignio.org";

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
  const [memberType, setMemberType] = useState<MemberType>("TECHNICAL_PROFESSIONAL");
  const [jobTitle, setJobTitle] = useState("");
  const [professionalCouncil, setProfessionalCouncil] = useState("CRP 06");
  const [professionalRegistration, setProfessionalRegistration] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) return;
    setEmail("");
    setFullName("");
    setRoleId("");
    setMemberType("TECHNICAL_PROFESSIONAL");
    setJobTitle("");
    setProfessionalCouncil("CRP 06");
    setProfessionalRegistration("");
    setErrors({});
  }, [open]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors["full_name"] = "Informe o nome completo.";
    if (!email.trim()) nextErrors["email"] = "Informe o e-mail institucional.";
    else if (!email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
      nextErrors["email"] = `Use uma conta ${INSTITUTIONAL_DOMAIN}.`;
    }
    if (!roleId) nextErrors["role_id"] = "Selecione o papel institucional.";
    if (!jobTitle.trim()) nextErrors["job_title"] = "Informe a função profissional.";
    if (memberType === "TECHNICAL_PROFESSIONAL" && !professionalRegistration.trim()) {
      nextErrors["professional_registration"] = "Informe o registro profissional.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await invite.mutateAsync({
        email: email.trim(),
        full_name: fullName.trim(),
        role_id: roleId,
        member_type: memberType,
        job_title: jobTitle.trim(),
        professional_council:
          memberType === "TECHNICAL_PROFESSIONAL" ? professionalCouncil.trim() || null : null,
        professional_registration:
          memberType === "TECHNICAL_PROFESSIONAL" ? professionalRegistration.trim() || null : null,
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
          <DialogTitle>Cadastrar profissional</DialogTitle>
          <DialogDescription>
            Defina o tipo de profissional, sua função e o nível inicial de acesso.
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
          <FormField id="invite-type" label="Tipo de profissional" error={errors["member_type"]}>
            <Select
              value={memberType}
              onValueChange={(value) => setMemberType(value as MemberType)}
            >
              <SelectTrigger id="invite-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TECHNICAL_PROFESSIONAL">Profissional técnico</SelectItem>
                <SelectItem value="ADMINISTRATIVE_PROFESSIONAL">
                  Profissional administrativo
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="invite-job-title"
            label="Função profissional"
            error={errors["job_title"]}
            hint="Ex.: Psicóloga, secretária ou gerente de projetos."
          >
            <Input
              id="invite-job-title"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
            />
          </FormField>
          {memberType === "TECHNICAL_PROFESSIONAL" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="invite-council"
                label="Conselho profissional"
                error={errors["professional_council"]}
              >
                <Input
                  id="invite-council"
                  value={professionalCouncil}
                  onChange={(event) => setProfessionalCouncil(event.target.value)}
                />
              </FormField>
              <FormField
                id="invite-registration"
                label="Registro profissional"
                error={errors["professional_registration"]}
                hint="Ex.: 204055"
              >
                <Input
                  id="invite-registration"
                  value={professionalRegistration}
                  onChange={(event) => setProfessionalRegistration(event.target.value)}
                />
              </FormField>
            </div>
          ) : null}
          <FormField id="invite-role" label="Papel institucional" error={errors["role_id"]}>
            <Select
              value={roleId}
              onValueChange={setRoleId}
              disabled={rolesQuery.isPending || rolesQuery.isError || roles.length === 0}
            >
              <SelectTrigger id="invite-role">
                <SelectValue
                  placeholder={
                    rolesQuery.isPending
                      ? "Carregando papéis…"
                      : rolesQuery.isError
                        ? "Não foi possível carregar os papéis"
                        : roles.length === 0
                          ? "Nenhum papel disponível"
                          : "Selecione um papel"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name ?? role.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rolesQuery.isError ? (
              <p className="mt-1 text-sm text-destructive">
                Atualize a página. Se o problema continuar, informe a administração do sistema.
              </p>
            ) : null}
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={invite.isPending} onClick={() => void handleSubmit()}>
            {invite.isPending ? "Cadastrando…" : "Cadastrar e enviar acesso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
