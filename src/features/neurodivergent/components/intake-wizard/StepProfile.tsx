import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionCheckboxGroup } from "@/components/forms/OptionCheckboxGroup";
import { FormField } from "@/features/persons/components/FormField";
import {
  CONDITION_OPTIONS,
  IDENTIFICATION_STATUS_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from "../../types";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="intake-identification"
          label="Situação de identificação"
          error={errors["identification_status"]}
        >
          <Select
            value={draft.identificationStatus}
            onValueChange={(value) => onChange({ identificationStatus: value })}
          >
            <SelectTrigger id="intake-identification">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {IDENTIFICATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="intake-report"
          label="Laudo ou relatório"
          error={errors["report_status"]}
        >
          <Select
            value={draft.reportStatus}
            onValueChange={(value) => onChange({ reportStatus: value })}
          >
            <SelectTrigger id="intake-report">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <OptionCheckboxGroup
        legend="Condições declaradas"
        hint="Pode escolher mais de uma."
        options={CONDITION_OPTIONS}
        selected={draft.conditions}
        onChange={(conditions) => onChange({ conditions })}
        error={errors["conditions"]}
      />

      {draft.conditions.includes("OTHER") ? (
        <FormField
          id="intake-other-condition"
          label="Qual outra condição"
          error={errors["other_condition"]}
        >
          <Input
            id="intake-other-condition"
            value={draft.otherCondition}
            onChange={(event) => onChange({ otherCondition: event.target.value })}
          />
        </FormField>
      ) : null}
    </div>
  );
}
