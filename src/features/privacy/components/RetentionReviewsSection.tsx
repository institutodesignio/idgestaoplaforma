import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonName } from "@/features/persons/components/PersonName";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRetentionReviews, useUpdateRetentionReview } from "../queries";
import {
  RETENTION_DECISION_LABEL,
  RETENTION_DECISION_OPTIONS,
  daysUntil,
  type RetentionDecision,
} from "../types";

export function RetentionReviewsSection({ canManage }: { canManage: boolean }) {
  const query = useRetentionReviews();
  const update = useUpdateRetentionReview();
  const [decisions, setDecisions] = useState<Record<string, RetentionDecision>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const reviews = query.data ?? [];

  async function handleSave(id: string) {
    const decision = decisions[id];
    const reason = (reasons[id] ?? "").trim();
    if (!decision) {
      toast.error("Escolha uma decisão de retenção.");
      return;
    }
    if (!reason) {
      toast.error("Registre a justificativa da decisão.");
      return;
    }
    try {
      await update.mutateAsync({ id, input: { decision, reason } });
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
        const remaining = daysUntil(review.review_due_at);
        return (
          <li key={review.id} className="surface-card space-y-3 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-48 flex-1">
                <p className="font-medium text-foreground">
                  <PersonName personId={review.person_id} fallback="Registro institucional" />
                </p>
                <p className="text-xs text-muted-foreground">
                  Revisão prevista para {formatDate(review.review_due_at)}
                  {remaining !== null
                    ? remaining < 0
                      ? ` • atrasada em ${Math.abs(remaining)} dia(s)`
                      : ` • ${remaining} dia(s) restantes`
                    : ""}
                  {review.last_confirmation_at
                    ? ` • última confirmação em ${formatDate(review.last_confirmation_at)}`
                    : ""}
                </p>
              </div>
              {review.decision ? (
                <Badge variant="outline">
                  {RETENTION_DECISION_LABEL[String(review.decision)] ?? review.decision}
                  {review.decided_at ? ` • ${formatDate(review.decided_at)}` : ""}
                </Badge>
              ) : (
                <Badge variant={remaining !== null && remaining < 0 ? "secondary" : "outline"}>
                  Pendente
                </Badge>
              )}
            </div>

            {review.reason ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{review.reason}</p>
            ) : null}

            {canManage ? (
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={decisions[review.id] ?? ""}
                  onValueChange={(value) =>
                    setDecisions((prev) => ({ ...prev, [review.id]: value as RetentionDecision }))
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
                <Input
                  value={reasons[review.id] ?? ""}
                  onChange={(event) =>
                    setReasons((prev) => ({ ...prev, [review.id]: event.target.value }))
                  }
                  placeholder="Justificativa da decisão"
                  aria-label="Justificativa da decisão de retenção"
                  className="max-w-xs"
                />
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
