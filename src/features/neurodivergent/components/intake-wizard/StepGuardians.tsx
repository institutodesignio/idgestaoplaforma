import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/features/persons/components/FormField";
import type { IntakeDraft, StepErrors } from "./state";

export function StepGuardians({
  draft,
  errors,
  onChange,
}: {
  draft: IntakeDraft;
  errors: StepErrors;
  onChange: (patch: Partial<IntakeDraft>) => void;
}) {
  function update(index: number, patch: Partial<IntakeDraft["guardians"][number]>) {
    const next = draft.guardians.map((guardian, current) =>
      current === index ? { ...guardian, ...patch } : guardian,
    );
    onChange({ guardians: next });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Responsáveis, familiares ou pessoas de referência. Preencha apenas se houver.
      </p>

      {draft.guardians.map((guardian, index) => (
        <fieldset key={index} className="surface-card space-y-4 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium text-foreground">Responsável {index + 1}</legend>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  guardians: draft.guardians.filter((_, current) => current !== index),
                })
              }
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remover
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={`guardian-name-${index}`}
              label="Nome completo"
              error={errors[`guardian_${index}_name`]}
            >
              <Input
                id={`guardian-name-${index}`}
                value={guardian.fullName}
                onChange={(event) => update(index, { fullName: event.target.value })}
              />
            </FormField>
            <FormField
              id={`guardian-relationship-${index}`}
              label="Vínculo com a pessoa"
              error={errors[`guardian_${index}_relationship`]}
            >
              <Input
                id={`guardian-relationship-${index}`}
                value={guardian.relationship}
                onChange={(event) => update(index, { relationship: event.target.value })}
                placeholder="Ex.: mãe, pai, avó, cuidador"
              />
            </FormField>
            <FormField id={`guardian-phone-${index}`} label="Telefone">
              <Input
                id={`guardian-phone-${index}`}
                value={guardian.phone}
                inputMode="tel"
                onChange={(event) => update(index, { phone: event.target.value })}
              />
            </FormField>
            <FormField id={`guardian-email-${index}`} label="E-mail">
              <Input
                id={`guardian-email-${index}`}
                type="email"
                value={guardian.email}
                onChange={(event) => update(index, { email: event.target.value })}
              />
            </FormField>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id={`guardian-legal-${index}`}
              checked={guardian.isLegalGuardian}
              onCheckedChange={(checked) => update(index, { isLegalGuardian: checked === true })}
            />
            <Label
              htmlFor={`guardian-legal-${index}`}
              className="text-sm font-normal leading-snug text-foreground"
            >
              É responsável legal
            </Label>
          </div>
        </fieldset>
      ))}

      <Button
        variant="outline"
        onClick={() =>
          onChange({
            guardians: [
              ...draft.guardians,
              { fullName: "", relationship: "", phone: "", email: "", isLegalGuardian: false },
            ],
          })
        }
      >
        <Plus aria-hidden="true" className="size-4" />
        Adicionar responsável
      </Button>
    </div>
  );
}
