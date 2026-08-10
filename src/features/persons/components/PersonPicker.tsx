import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePersonsList } from "../queries";
import type { Person } from "../types";

/** Seletor de pessoa por busca — evita digitar UUID manualmente. */
export function PersonPicker({
  value,
  onChange,
  excludeId,
  selectedLabel,
}: {
  value: string;
  onChange: (personId: string, person: Person) => void;
  excludeId?: string;
  selectedLabel?: string | null;
}) {
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(term.trim()), 350);
    return () => clearTimeout(timer);
  }, [term]);

  const query = usePersonsList({ page: 1, limit: 8, search }, search.length >= 2);
  const results = (query.data?.data ?? []).filter((person) => person.id !== excludeId);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar pessoa por nome ou e-mail"
          className="pl-9"
          aria-label="Buscar pessoa relacionada"
        />
      </div>

      {selectedLabel && !term ? (
        <p className="text-xs text-muted-foreground">
          Selecionada: <span className="font-medium text-foreground">{selectedLabel}</span>
        </p>
      ) : null}

      {search.length >= 2 ? (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-border">
          {query.isLoading ? (
            <p className="p-3 text-xs text-muted-foreground">Buscando…</p>
          ) : query.isError ? (
            <p className="p-3 text-xs text-destructive">Não foi possível buscar pessoas.</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">Nenhuma pessoa encontrada.</p>
          ) : (
            <ul>
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => onChange(person.id, person)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                      value === person.id && "bg-secondary",
                    )}
                  >
                    <span>
                      <span className="font-medium text-foreground">{person.full_name}</span>
                      {person.primary_email ? (
                        <span className="block text-xs text-muted-foreground">
                          {person.primary_email}
                        </span>
                      ) : null}
                    </span>
                    {value === person.id ? (
                      <Check aria-hidden="true" className="size-4 text-primary" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Digite ao menos 2 caracteres para buscar.</p>
      )}
    </div>
  );
}
