import { Input } from "@/components/ui/input";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { useSession } from "@/contexts/SessionContext";
import type { IntakeDraft, StepErrors } from "./state";

export function StepPersonTerritory({
  draft,
  errors,
  onChange,
}: {
  draft: IntakeDraft;
  errors: StepErrors;
  onChange: (patch: Partial<IntakeDraft>) => void;
}) {
  const { can } = useSession();

  return (
    <div className="space-y-5">
      {can("person.read") ? (
        <FormField
          id="intake-person"
          label="Vincular a uma pessoa já cadastrada"
          hint="Opcional. Se não encontrar, siga preenchendo os dados abaixo."
        >
          <PersonPicker
            value={draft.personId}
            selectedLabel={draft.personLabel}
            onChange={(id, person) =>
              onChange({
                personId: id,
                personLabel: person.full_name ?? null,
                fullName: draft.fullName || (person.full_name ?? ""),
              })
            }
          />
        </FormField>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="intake-name" label="Nome completo" error={errors["full_name"]}>
          <Input
            id="intake-name"
            value={draft.fullName}
            onChange={(event) => onChange({ fullName: event.target.value })}
            autoComplete="name"
          />
        </FormField>
        <FormField
          id="intake-preferred"
          label="Como prefere ser chamada"
          hint="Usamos este nome no acolhimento."
        >
          <Input
            id="intake-preferred"
            value={draft.preferredName}
            onChange={(event) => onChange({ preferredName: event.target.value })}
          />
        </FormField>
        <FormField id="intake-birth" label="Data de nascimento">
          <Input
            id="intake-birth"
            type="date"
            value={draft.birthDate}
            onChange={(event) => onChange({ birthDate: event.target.value })}
          />
        </FormField>
        <FormField id="intake-phone" label="Telefone de contato">
          <Input
            id="intake-phone"
            value={draft.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            inputMode="tel"
          />
        </FormField>
        <FormField id="intake-email" label="E-mail">
          <Input
            id="intake-email"
            type="email"
            value={draft.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </FormField>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-foreground">Território</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="intake-postal" label="CEP">
            <Input
              id="intake-postal"
              value={draft.postalCode}
              onChange={(event) => onChange({ postalCode: event.target.value })}
              inputMode="numeric"
            />
          </FormField>
          <FormField id="intake-neighborhood" label="Bairro">
            <Input
              id="intake-neighborhood"
              value={draft.neighborhood}
              onChange={(event) => onChange({ neighborhood: event.target.value })}
            />
          </FormField>
          <FormField id="intake-city" label="Cidade" error={errors["city"]}>
            <Input
              id="intake-city"
              value={draft.city}
              onChange={(event) => onChange({ city: event.target.value })}
            />
          </FormField>
          <FormField id="intake-state" label="Estado (UF)" error={errors["state_code"]}>
            <Input
              id="intake-state"
              value={draft.stateCode}
              maxLength={2}
              onChange={(event) => onChange({ stateCode: event.target.value.toUpperCase() })}
            />
          </FormField>
        </div>
      </fieldset>
    </div>
  );
}