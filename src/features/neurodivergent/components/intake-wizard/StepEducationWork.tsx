import { Input } from "@/components/ui/input";
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
import { EDUCATION_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepEducationWork({
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
        legend="Situação educacional"
        hint="Pode escolher mais de uma opção."
        options={EDUCATION_STATUS_OPTIONS}
        selected={draft.educationStatuses}
        onChange={(educationStatuses) => onChange({ educationStatuses })}
        error={errors["education_statuses"]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="intake-institution" label="Instituição de ensino">
          <Input
            id="intake-institution"
            value={draft.educationInstitution}
            onChange={(event) => onChange({ educationInstitution: event.target.value })}
          />
        </FormField>

        <FormField id="intake-employment" label="Situação de trabalho">
          <Select
            value={draft.employmentStatus}
            onValueChange={(value) => onChange({ employmentStatus: value })}
          >
            <SelectTrigger id="intake-employment">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="intake-school-support"
        label="Apoio escolar necessário"
        hint="Descreva o que ajudaria no ambiente educacional."
      >
        <Textarea
          id="intake-school-support"
          value={draft.schoolSupportNeeded}
          onChange={(event) => onChange({ schoolSupportNeeded: event.target.value })}
          rows={3}
        />
      </FormField>
    </div>
  );
}
