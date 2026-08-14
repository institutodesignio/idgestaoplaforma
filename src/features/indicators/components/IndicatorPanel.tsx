import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { useNeurodivergentIndicator } from "../queries";
import { DIMENSION_LABEL, type IndicatorDimension } from "../types";

/**
 * Exibe somente o agregado devolvido pela API. Grupos suprimidos aparecem como
 * protegidos, sem qualquer inferência de valor no frontend.
 */
export function IndicatorPanel({ dimension }: { dimension: IndicatorDimension }) {
  const query = useNeurodivergentIndicator(dimension);
  const indicator = query.data;

  if (query.isLoading) return <ListSkeleton rows={3} />;

  if (query.isError) {
    return (
      <ErrorState
        title={`Não foi possível carregar ${DIMENSION_LABEL[dimension].toLowerCase()}`}
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!indicator || indicator.buckets.length === 0) {
    return (
      <EmptyState
        title={DIMENSION_LABEL[dimension]}
        description="Ainda não há agregado disponível para esta dimensão."
      />
    );
  }

  const maxValue = indicator.buckets.reduce((max, bucket) => Math.max(max, bucket.value ?? 0), 0);

  return (
    <section aria-label={DIMENSION_LABEL[dimension]} className="surface-card rounded-2xl p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {DIMENSION_LABEL[dimension]}
        </h2>
        {indicator.total !== null ? (
          <p className="text-sm text-muted-foreground">
            Total considerado:{" "}
            <span className="font-medium text-foreground">{indicator.total}</span>
          </p>
        ) : null}
      </header>

      <ul className="mt-5 space-y-4">
        {indicator.buckets.map((bucket) => (
          <li key={bucket.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">{bucket.label}</span>
              <span className="text-muted-foreground">
                {bucket.suppressed ? "Protegido" : bucket.value}
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={
                bucket.suppressed
                  ? `${bucket.label}: valor protegido para preservar a privacidade`
                  : `${bucket.label}: ${bucket.value}`
              }
            >
              {bucket.suppressed ? null : (
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${maxValue > 0 ? Math.round(((bucket.value ?? 0) / maxValue) * 100) : 0}%`,
                  }}
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        {indicator.notice ??
          "Grupos pequenos são protegidos pelo backend institucional e exibidos como “Protegido”."}
      </p>
    </section>
  );
}
