import { Textarea } from "@/components/ui/textarea";
import { OptionCheckboxGroup } from "@/components/forms/OptionCheckboxGroup";
import { FormField } from "@/features/persons/components/FormField";
import { MAX_PRIORITY_NEEDS, PRIORITY_NEED_OPTIONS, SUPPORT_NETWORK_OPTIONS } from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepNetworkNeeds({
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
        legend="Rede de apoio"
        hint="Quem acompanha e apoia hoje."
        options={SUPPORT_NETWORK_OPTIONS}
        selected={draft.supportNetwork}
        onChange={(supportNetwork) => onChange({ supportNetwork })}
        error={errors["support_network"]}
      />

      <OptionCheckboxGroup
        legend="Necessidades prioritárias"
        hint={`Escolha até ${MAX_PRIORITY_NEEDS} necessidades mais urgentes.`}
        options={PRIORITY_NEED_OPTIONS}
        selected={draft.priorityNeeds}
        onChange={(priorityNeeds) => onChange({ priorityNeeds })}
        max={MAX_PRIORITY_NEEDS}
        error={errors["priority_needs"]}
      />

      <FormField id="intake-notes" label="Algo mais que queira contar">
        <Textarea
          id="intake-notes"
          value={draft.additionalNotes}
          onChange={(event) => onChange({ additionalNotes: event.target.value })}
          rows={4}
        />
      </FormField>
    </div>
  );
}