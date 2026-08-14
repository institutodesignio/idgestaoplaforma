import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CONSENT_DEFINITIONS } from "../../types";
import type { IntakeDraft, StepErrors } from "./state";

export function StepPrivacy({
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
      <p className="text-sm leading-relaxed text-muted-foreground">
        Nenhum consentimento vem marcado. Você decide o que autorizar e pode revogar depois,
        falando com o Instituto Designio.
      </p>

      <ul className="space-y-4">
        {CONSENT_DEFINITIONS.map((consent) => {
          const id = `consent-${consent.type}`;
          const error = errors[`consent_${consent.type}`];
          return (
            <li key={consent.type} className="surface-card rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={id}
                  checked={draft.consents[consent.type] === true}
                  onCheckedChange={(checked) =>
                    onChange({
                      consents: { ...draft.consents, [consent.type]: checked === true },
                    })
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor={id} className="text-sm font-medium leading-snug text-foreground">
                    {consent.label}
                    {consent.required ? " (necessário)" : ""}
                  </Label>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {consent.description}
                  </p>
                  {error ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}