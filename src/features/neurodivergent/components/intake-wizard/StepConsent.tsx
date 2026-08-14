import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionCheckboxGroup } from "@/components/forms/OptionCheckboxGroup";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import {
  COMMUNICATION_CHANNEL_OPTIONS,
  CONSENT_ROLE_OPTIONS,
  CONSENT_TERM_VERSION,
  type ConsentRole,
} from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepConsent({
  draft,
  errors,
  onChange,
}: {
  draft: IntakeDraft;
  errors: StepErrors;
  onChange: (patch: Partial<IntakeDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Nada vem marcado. O consentimento é registrado com a versão do termo {CONSENT_TERM_VERSION} e
        pode ser revogado depois na ficha do cadastro.
      </p>

      <FormField
        id="intake-consented-by"
        label="Quem assina o consentimento"
        hint="Pessoa cadastrada em Pessoas."
        error={errors["consented_by_person_id"]}
      >
        <PersonPicker
          value={draft.consentedByPersonId}
          selectedLabel={draft.consentedByPersonLabel}
          onChange={(id, person) =>
            onChange({ consentedByPersonId: id, consentedByPersonLabel: person.full_name ?? null })
          }
        />
      </FormField>

      <FormField id="intake-consent-role" label="Papel de quem consente" error={errors["consent_role"]}>
        <Select
          value={draft.consentRole}
          onValueChange={(value) => onChange({ consentRole: value as ConsentRole })}
        >
          <SelectTrigger id="intake-consent-role">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {CONSENT_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="surface-card space-y-4 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="intake-sensitive"
            checked={draft.sensitiveDataConsent}
            onCheckedChange={(checked) => onChange({ sensitiveDataConsent: checked === true })}
          />
          <div className="space-y-1">
            <Label
              htmlFor="intake-sensitive"
              className="text-sm font-medium leading-snug text-foreground"
            >
              Autorizo o tratamento de dados pessoais sensíveis (necessário)
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Necessário para registrar informações de saúde e neurodivergência com finalidade de
              acolhimento e acompanhamento.
            </p>
            {errors["sensitive_data_consent"] ? (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors["sensitive_data_consent"]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="intake-assent"
            checked={draft.assentRecorded}
            onCheckedChange={(checked) => onChange({ assentRecorded: checked === true })}
          />
          <Label
            htmlFor="intake-assent"
            className="text-sm font-normal leading-snug text-foreground"
          >
            Assentimento da pessoa registrado no acolhimento
          </Label>
        </div>
      </div>

      <OptionCheckboxGroup
        legend="Canais de comunicação autorizados"
        options={COMMUNICATION_CHANNEL_OPTIONS}
        selected={draft.communicationChannels}
        onChange={(communicationChannels) => onChange({ communicationChannels })}
        error={errors["communication_channels"]}
      />
    </div>
  );
}
