import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OptionCheckboxGroup } from "@/components/forms/OptionCheckboxGroup";
import { FormField } from "@/features/persons/components/FormField";
import { CONDITION_OPTIONS, DIAGNOSIS_STATUS_OPTIONS, SUPPORT_LEVEL_OPTIONS } from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepProfile({
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
      <OptionCheckboxGroup
        legend="Condições declaradas"
        hint="Você pode escolher mais de uma. Nada aqui é obrigatório declarar."
        options={CONDITION_OPTIONS}
        selected={draft.conditions}
        onChange={(conditions) => onChange({ conditions })}
        error={errors["conditions"]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="intake-diagnosis"
          label="Situação do diagnóstico"
          error={errors["diagnosis_status"]}
        >
          <Select
            value={draft.diagnosisStatus}
            onValueChange={(value) => onChange({ diagnosisStatus: value })}
          >
            <SelectTrigger id="intake-diagnosis">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {DIAGNOSIS_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="intake-support" label="Nível de apoio necessário">
          <Select
            value={draft.supportLevel}
            onValueChange={(value) => onChange({ supportLevel: value })}
          >
            <SelectTrigger id="intake-support">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORT_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="intake-communication"
        label="Comunicação e preferências de acolhimento"
        hint="Conte o que ajuda no atendimento (ambiente, ritmo, formas de comunicar)."
      >
        <Textarea
          id="intake-communication"
          value={draft.communicationNotes}
          onChange={(event) => onChange({ communicationNotes: event.target.value })}
          rows={4}
        />
      </FormField>
    </div>
  );
}
