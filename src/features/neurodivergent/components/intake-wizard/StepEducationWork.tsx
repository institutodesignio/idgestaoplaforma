import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/persons/components/FormField";
import { EDUCATION_STATUS_OPTIONS, WORK_STATUS_OPTIONS } from "../../types";
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
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="intake-education"
          label="Situação educacional"
          error={errors["education_status"]}
        >
          <Select
            value={draft.educationStatus}
            onValueChange={(value) => onChange({ educationStatus: value })}
          >
            <SelectTrigger id="intake-education">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="intake-work" label="Situação de trabalho" error={errors["work_status"]}>
          <Select
            value={draft.workStatus}
            onValueChange={(value) => onChange({ workStatus: value })}
          >
            <SelectTrigger id="intake-work">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {WORK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField id="intake-school" label="Escola ou instituição de ensino">
        <Input
          id="intake-school"
          value={draft.schoolName}
          onChange={(event) => onChange({ schoolName: event.target.value })}
        />
      </FormField>

      <div className="flex items-start gap-2">
        <Checkbox
          id="intake-school-support"
          checked={draft.hasSchoolSupport}
          onCheckedChange={(checked) => onChange({ hasSchoolSupport: checked === true })}
        />
        <Label
          htmlFor="intake-school-support"
          className="text-sm font-normal leading-snug text-foreground"
        >
          Recebe apoio educacional especializado atualmente
        </Label>
      </div>
    </div>
  );
}