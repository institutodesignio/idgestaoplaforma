import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type Option = { value: string; label: string };

/** Grupo acessível de múltipla escolha com limite opcional de seleções. */
export function OptionCheckboxGroup({
  legend,
  options,
  selected,
  onChange,
  max,
  hint,
  error,
  columns = 2,
}: {
  legend: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
  hint?: string;
  error?: string | undefined;
  columns?: 1 | 2;
}) {
  const limitReached = typeof max === "number" && selected.length >= max;

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    if (limitReached) return;
    onChange([...selected, value]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className={columns === 1 ? "space-y-2" : "grid gap-2 sm:grid-cols-2"}>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          const id = `${legend}-${option.value}`.replace(/\s+/g, "-").toLowerCase();
          return (
            <div key={option.value} className="flex items-start gap-2">
              <Checkbox
                id={id}
                checked={checked}
                disabled={!checked && limitReached}
                onCheckedChange={() => toggle(option.value)}
              />
              <Label htmlFor={id} className="text-sm font-normal leading-snug text-foreground">
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      {limitReached && max ? (
        <p className="text-xs text-muted-foreground">
          Limite de {max} seleções atingido. Desmarque uma opção para escolher outra.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
