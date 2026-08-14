import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRetentionReviews, useUpdateRetentionReview } from "../queries";
import { RETENTION_DECISION_OPTIONS, RETENTION_STATUS_LABEL, daysUntil } from "../types";

export function RetentionReviewsSection({ canManage }: { canManage: boolean }) {
  const query = useRetentionReviews();
  const update = useUpdateRetentionReview();
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const reviews = query.data ?? [];

  async function handleSave(id: string) {
    const decision = decisions[id];
    if (!decision) {
      toast.error("Escolha uma decisão de retenção.");
      return;
    }
    try {
      await update.mutateAsync({ id, input: { decision } });
      toast.success("Revisão registrada.");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  if (query.isLoading) return <ListSkeleton rows={3} />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar as revisões de retenção"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Nenhuma revisão pendente"
        description="As revisões de retenção aparecem aqui conforme os prazos institucionais."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => {
        const remaining = daysUntil(review.due_at);
        return (
          <li
            key={review.id}
            className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
          >
            <div className="min-w-48 flex-1">
              <p className="font-medium text-foreground">
                {review.person?.full_name ?? review.resource_type ?? "Registro institucional"}
              </p>
              <p className="text-xs text-muted-foreground">
                Prazo {formatDate(review.due_at)}
                {remaining !== null
                  ? remaining < 0
                    ? ` • atrasada em ${Math.abs(remaining)} dia(s)`
                    : ` • ${remaining} dia(s) restantes`
                  : ""}
              </p>
            </div>
            <Badge variant={remaining !== null && remaining < 0 ? "secondary" : "outline"}>
              {RETENTION_STATUS_LABEL[String(review.status)] ?? review.status ?? "Pendente"}
            </Badge>
            {canManage ? (
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={decisions[review.id] ?? review.decision ?? ""}
                  onValueChange={(value) =>
                    setDecisions((prev) => ({ ...prev, [review.id]: value }))
                  }
                >
                  <SelectTrigger aria-label="Decisão de retenção" className="w-56">
                    <SelectValue placeholder="Escolher decisão" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETENTION_DECISION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={update.isPending}
                  onClick={() => void handleSave(review.id)}
                >
                  Registrar
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
