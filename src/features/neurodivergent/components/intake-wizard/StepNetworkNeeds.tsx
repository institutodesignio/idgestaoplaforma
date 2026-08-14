import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OptionCheckboxGroup } from "@/components/forms/OptionCheckboxGroup";
import { FormField } from "@/features/persons/components/FormField";
import {
  ACCESSIBILITY_SUPPORT_OPTIONS,
  MAX_PRIORITY_NEEDS,
  PRIORITY_NEED_OPTIONS,
  SERVICE_NETWORK_OPTIONS,
} from "../../types";
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
        legend="Redes de serviço acessadas"
        options={SERVICE_NETWORK_OPTIONS}
        selected={draft.serviceNetworks}
        onChange={(serviceNetworks) => onChange({ serviceNetworks })}
        error={errors["service_networks"]}
      />

      <FormField id="intake-current-services" label="Serviços em andamento">
        <Textarea
          id="intake-current-services"
          value={draft.currentServices}
          onChange={(event) => onChange({ currentServices: event.target.value })}
          rows={3}
        />
      </FormField>

      <div className="flex items-start gap-2">
        <Checkbox
          id="intake-waiting"
          checked={draft.waitingForService}
          onCheckedChange={(checked) => onChange({ waitingForService: checked === true })}
        />
        <Label
          htmlFor="intake-waiting"
          className="text-sm font-normal leading-snug text-foreground"
        >
          Está aguardando algum serviço ou avaliação
        </Label>
      </div>

      {draft.waitingForService ? (
        <FormField
          id="intake-waiting-details"
          label="O que está aguardando"
          error={errors["waiting_details"]}
        >
          <Textarea
            id="intake-waiting-details"
            value={draft.waitingDetails}
            onChange={(event) => onChange({ waitingDetails: event.target.value })}
            rows={3}
          />
        </FormField>
      ) : null}

      <OptionCheckboxGroup
        legend="Necessidades prioritárias"
        hint={`Escolha até ${MAX_PRIORITY_NEEDS} necessidades mais urgentes.`}
        options={PRIORITY_NEED_OPTIONS}
        selected={draft.priorityNeeds}
        onChange={(priorityNeeds) => onChange({ priorityNeeds })}
        max={MAX_PRIORITY_NEEDS}
        error={errors["priority_needs"]}
      />

      <FormField
        id="intake-barrier"
        label="Principal barreira enfrentada hoje"
        error={errors["primary_need_barrier"]}
      >
        <Textarea
          id="intake-barrier"
          value={draft.primaryNeedBarrier}
          onChange={(event) => onChange({ primaryNeedBarrier: event.target.value })}
          rows={3}
        />
      </FormField>

      <OptionCheckboxGroup
        legend="Apoios de acessibilidade"
        options={ACCESSIBILITY_SUPPORT_OPTIONS}
        selected={draft.accessibilitySupports}
        onChange={(accessibilitySupports) => onChange({ accessibilitySupports })}
      />

      {draft.accessibilitySupports.includes("OTHER") ? (
        <FormField
          id="intake-accessibility-other"
          label="Qual outro apoio"
          error={errors["accessibility_other"]}
        >
          <Input
            id="intake-accessibility-other"
            value={draft.accessibilityOther}
            onChange={(event) => onChange({ accessibilityOther: event.target.value })}
          />
        </FormField>
      ) : null}
    </div>
  );
}
