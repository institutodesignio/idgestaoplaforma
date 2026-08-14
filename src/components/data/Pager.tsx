import { Button } from "@/components/ui/button";
import type { Pagination } from "@/features/persons/types";

export function Pager({
  pagination,
  unitLabel,
  onChange,
}: {
  pagination: Pagination | undefined;
  unitLabel: string;
  onChange: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Página {pagination.page} de {pagination.totalPages} • {pagination.total} {unitLabel}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onChange(Math.max(1, pagination.page - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onChange(pagination.page + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}