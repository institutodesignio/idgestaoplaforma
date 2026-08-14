import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { useNeurodivergentIndicator } from "../queries";
import { DIMENSION_LABEL, type IndicatorDimension } from "../types";

/**
 * Exibe somente o agregado devolvido pela API — o frontend não infere,
 * completa nem estima grupos ausentes.
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

  const maxValue = indicator.buckets.reduce((max, bucket) => Math.max(max, bucket.value), 0);

  return (
    <section aria-label={DIMENSION_LABEL[dimension]} className="surface-card rounded-2xl p-6">
      <header>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {DIMENSION_LABEL[dimension]}
        </h2>
      </header>

      <ul className="mt-5 space-y-4">
        {indicator.buckets.map((bucket) => (
          <li key={bucket.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">{bucket.label}</span>
              <span className="text-muted-foreground">{bucket.value}</span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={`${bucket.label}: ${bucket.value}`}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${maxValue > 0 ? Math.round((bucket.value / maxValue) * 100) : 0}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {indicator.minimumGroupSize !== null ? (
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Agregado sem dados identificados. Grupos com menos de {indicator.minimumGroupSize}{" "}
          pessoas não são divulgados pelo backend institucional.
        </p>
      ) : null}
    </section>
  );
}
