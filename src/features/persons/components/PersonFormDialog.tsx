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
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useCreatePerson, useUpdatePerson } from "../queries";
import type { Person, PersonInput, PersonStatus, PersonType } from "../types";
import { FormField } from "./FormField";

type FormState = {
  person_type: PersonType;
  full_name: string;
  preferred_name: string;
  birth_date: string;
  gender: string;
  marital_status: string;
  nationality: string;
  occupation: string;
  cpf: string;
  cnpj: string;
  rg: string;
  rg_issuer: string;
  nis: string;
  primary_email: string;
  primary_phone: string;
  status: PersonStatus;
};

const EMPTY: FormState = {
  person_type: "INDIVIDUAL",
  full_name: "",
  preferred_name: "",
  birth_date: "",
  gender: "",
  marital_status: "",
  nationality: "",
  occupation: "",
  cpf: "",
  cnpj: "",
  rg: "",
  rg_issuer: "",
  nis: "",
  primary_email: "",
  primary_phone: "",
  status: "ACTIVE",
};

function fromPerson(person: Person): FormState {
  return {
    person_type: person.person_type ?? "INDIVIDUAL",
    full_name: person.full_name ?? "",
    preferred_name: person.preferred_name ?? "",
    birth_date: person.birth_date ? String(person.birth_date).slice(0, 10) : "",
    gender: person.gender ?? "",
    marital_status: person.marital_status ?? "",
    nationality: person.nationality ?? "",
    occupation: person.occupation ?? "",
    cpf: person.cpf ?? "",
    cnpj: person.cnpj ?? "",
    rg: person.rg ?? "",
    rg_issuer: person.rg_issuer ?? "",
    nis: person.nis ?? "",
    primary_email: person.primary_email ?? "",
    primary_phone: person.primary_phone ?? "",
    status: person.status ?? "ACTIVE",
  };
}

const digits = (value: string) => value.replace(/\D/g, "");

function validate(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (state.full_name.trim().length < 3) {
    errors['full_name'] = "Informe o nome completo (mínimo 3 caracteres).";
  }
  if (state.primary_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.primary_email.trim())) {
    errors['primary_email'] = "E-mail inválido.";
  }
  if (state.person_type === "INDIVIDUAL" && state.cpf && digits(state.cpf).length !== 11) {
    errors['cpf'] = "O CPF deve ter 11 dígitos.";
  }
  if (state.person_type === "ORGANIZATION" && state.cnpj && digits(state.cnpj).length !== 14) {
    errors['cnpj'] = "O CNPJ deve ter 14 dígitos.";
  }
  return errors;
}

function toPayload(state: FormState): PersonInput {
  const nullable = (value: string) => (value.trim() === "" ? null : value.trim());
  const isIndividual = state.person_type === "INDIVIDUAL";
  return {
    person_type: state.person_type,
    full_name: state.full_name.trim(),
    preferred_name: nullable(state.preferred_name),
    birth_date: nullable(state.birth_date),
    gender: nullable(state.gender),
    marital_status: nullable(state.marital_status),
    nationality: nullable(state.nationality),
    occupation: nullable(state.occupation),
    cpf: isIndividual ? (state.cpf ? digits(state.cpf) : null) : null,
    cnpj: isIndividual ? null : state.cnpj ? digits(state.cnpj) : null,
    rg: nullable(state.rg),
    rg_issuer: nullable(state.rg_issuer),
    nis: nullable(state.nis),
    primary_email: nullable(state.primary_email),
    primary_phone: nullable(state.primary_phone),
    status: state.status,
  };
}

export function PersonFormDialog({
  open,
  onOpenChange,
  person,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
  onSaved?: (personId: string | null) => void;
}) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useCreatePerson();
  const update = useUpdatePerson(person?.id ?? "");
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState(person ? fromPerson(person) : EMPTY);
  }, [open, person]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validate(state);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    try {
      const payload = toPayload(state);
      if (person) {
        await update.mutateAsync(payload);
        toast.success("Pessoa atualizada.");
        onSaved?.(person.id);
      } else {
        const result = await create.mutateAsync(payload);
        const created =
          result && typeof result === "object" && "person" in result
            ? (result.person ?? null)
            : (result as Person | null);
        toast.success("Pessoa cadastrada.");
        onSaved?.(created?.id ?? null);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const isIndividual = state.person_type === "INDIVIDUAL";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{person ? "Editar pessoa" : "Nova pessoa"}</DialogTitle>
          <DialogDescription>
            Os dados são gravados diretamente no backend institucional do ID Gestão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="person_type" label="Tipo" error={errors['person_type']}>
              <Select
                value={state.person_type}
                onValueChange={(value) => set("person_type", value as PersonType)}
              >
                <SelectTrigger id="person_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Pessoa física</SelectItem>
                  <SelectItem value="ORGANIZATION">Organização</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="status" label="Situação" error={errors['status']}>
              <Select
                value={state.status}
                onValueChange={(value) => set("status", value as PersonStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="full_name"
              label={isIndividual ? "Nome completo" : "Razão social"}
              error={errors['full_name']}
            >
              <Input
                id="full_name"
                value={state.full_name}
                onChange={(event) => set("full_name", event.target.value)}
                maxLength={180}
                required
              />
            </FormField>

            <FormField
              id="preferred_name"
              label={isIndividual ? "Nome preferido" : "Nome fantasia"}
              error={errors['preferred_name']}
            >
              <Input
                id="preferred_name"
                value={state.preferred_name}
                onChange={(event) => set("preferred_name", event.target.value)}
                maxLength={120}
              />
            </FormField>

            {isIndividual ? (
              <FormField id="cpf" label="CPF" error={errors['cpf']} hint="Somente números.">
                <Input
                  id="cpf"
                  value={state.cpf}
                  onChange={(event) => set("cpf", event.target.value)}
                  inputMode="numeric"
                  maxLength={14}
                />
              </FormField>
            ) : (
              <FormField id="cnpj" label="CNPJ" error={errors['cnpj']} hint="Somente números.">
                <Input
                  id="cnpj"
                  value={state.cnpj}
                  onChange={(event) => set("cnpj", event.target.value)}
                  inputMode="numeric"
                  maxLength={18}
                />
              </FormField>
            )}

            <FormField id="primary_email" label="E-mail principal" error={errors['primary_email']}>
              <Input
                id="primary_email"
                type="email"
                value={state.primary_email}
                onChange={(event) => set("primary_email", event.target.value)}
                maxLength={180}
              />
            </FormField>

            <FormField id="primary_phone" label="Telefone principal" error={errors['primary_phone']}>
              <Input
                id="primary_phone"
                value={state.primary_phone}
                onChange={(event) => set("primary_phone", event.target.value)}
                maxLength={40}
              />
            </FormField>

            {isIndividual ? (
              <>
                <FormField id="birth_date" label="Data de nascimento" error={errors['birth_date']}>
                  <Input
                    id="birth_date"
                    type="date"
                    value={state.birth_date}
                    onChange={(event) => set("birth_date", event.target.value)}
                  />
                </FormField>

                <FormField id="gender" label="Gênero" error={errors['gender']}>
                  <Input
                    id="gender"
                    value={state.gender}
                    onChange={(event) => set("gender", event.target.value)}
                    maxLength={40}
                  />
                </FormField>

                <FormField id="marital_status" label="Estado civil" error={errors['marital_status']}>
                  <Input
                    id="marital_status"
                    value={state.marital_status}
                    onChange={(event) => set("marital_status", event.target.value)}
                    maxLength={40}
                  />
                </FormField>

                <FormField id="nationality" label="Nacionalidade" error={errors['nationality']}>
                  <Input
                    id="nationality"
                    value={state.nationality}
                    onChange={(event) => set("nationality", event.target.value)}
                    maxLength={60}
                  />
                </FormField>

                <FormField id="occupation" label="Ocupação" error={errors['occupation']}>
                  <Input
                    id="occupation"
                    value={state.occupation}
                    onChange={(event) => set("occupation", event.target.value)}
                    maxLength={80}
                  />
                </FormField>

                <FormField id="rg" label="RG" error={errors['rg']}>
                  <Input
                    id="rg"
                    value={state.rg}
                    onChange={(event) => set("rg", event.target.value)}
                    maxLength={30}
                  />
                </FormField>

                <FormField id="rg_issuer" label="Órgão emissor do RG" error={errors['rg_issuer']}>
                  <Input
                    id="rg_issuer"
                    value={state.rg_issuer}
                    onChange={(event) => set("rg_issuer", event.target.value)}
                    maxLength={30}
                  />
                </FormField>

                <FormField id="nis" label="NIS" error={errors['nis']}>
                  <Input
                    id="nis"
                    value={state.nis}
                    onChange={(event) => set("nis", event.target.value)}
                    maxLength={30}
                  />
                </FormField>
              </>
            ) : (
              <FormField id="occupation-org" label="Área de atuação" error={errors['occupation']}>
                <Input
                  id="occupation-org"
                  value={state.occupation}
                  onChange={(event) => set("occupation", event.target.value)}
                  maxLength={80}
                />
              </FormField>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : person ? "Salvar alterações" : "Cadastrar pessoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}