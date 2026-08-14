import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { CHANNEL_OPTIONS, RESPONDENT_ROLE_OPTIONS, type IntakeChannel } from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepPersonRespondent({
  draft,
  errors,
  onChange,
}: {
  draft: IntakeDraft;
  errors: StepErrors;
  onChange: (patch: Partial<IntakeDraft>) => void;
}) {
  const needsRespondentPerson = Boolean(draft.respondentRole) && draft.respondentRole !== "SELF";

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        A pessoa e, quando houver, quem responde por ela precisam estar cadastrados no módulo
        Pessoas antes deste cadastro.
      </p>

      <FormField
        id="intake-person"
        label="Pessoa acolhida"
        hint="Busque pelo nome já cadastrado em Pessoas."
        error={errors["person_id"]}
      >
        <PersonPicker
          value={draft.personId}
          selectedLabel={draft.personLabel}
          onChange={(id, person) =>
            onChange({ personId: id, personLabel: person.full_name ?? null })
          }
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="intake-respondent-role"
          label="Quem responde"
          error={errors["respondent_role"]}
        >
          <Select
            value={draft.respondentRole}
            onValueChange={(value) =>
              onChange({
                respondentRole: value as IntakeDraft["respondentRole"],
                ...(value === "SELF"
                  ? { respondentPersonId: "", respondentPersonLabel: null }
                  : {}),
              })
            }
          >
            <SelectTrigger id="intake-respondent-role">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {RESPONDENT_ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="intake-channel" label="Canal do acolhimento">
          <Select
            value={draft.channel}
            onValueChange={(value) => onChange({ channel: value as IntakeChannel })}
          >
            <SelectTrigger id="intake-channel">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {needsRespondentPerson ? (
        <FormField
          id="intake-respondent-person"
          label="Pessoa que está respondendo"
          hint="Cadastre antes em Pessoas, se necessário."
          error={errors["respondent_person_id"]}
        >
          <PersonPicker
            value={draft.respondentPersonId}
            selectedLabel={draft.respondentPersonLabel}
            onChange={(id, person) =>
              onChange({ respondentPersonId: id, respondentPersonLabel: person.full_name ?? null })
            }
          />
        </FormField>
      ) : null}

      <FormField
        id="intake-respondent-relationship"
        label="Vínculo com a pessoa"
        hint="Obrigatório quando o vínculo é “Outro”."
        error={errors["respondent_relationship"]}
      >
        <Input
          id="intake-respondent-relationship"
          value={draft.respondentRelationship}
          maxLength={120}
          onChange={(event) => onChange({ respondentRelationship: event.target.value })}
        />
      </FormField>
    </div>
  );
}
