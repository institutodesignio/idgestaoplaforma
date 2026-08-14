/** Agregado protegido: o backend suprime grupos pequenos e o frontend nunca infere valores. */
export type IndicatorDimension = "condition" | "priority_need";

export type IndicatorBucket = {
  key?: string | null;
  label?: string | null;
  value?: number | null;
  count?: number | null;
  suppressed?: boolean | null;
};

export type IndicatorResponse = {
  dimension?: string;
  total?: number | null;
  data?: IndicatorBucket[];
  buckets?: IndicatorBucket[];
  results?: IndicatorBucket[];
  suppression_threshold?: number | null;
  generated_at?: string | null;
  notice?: string | null;
};

export type NormalizedIndicator = {
  total: number | null;
  threshold: number | null;
  generatedAt: string | null;
  notice: string | null;
  buckets: { label: string; value: number | null; suppressed: boolean }[];
};

export const DIMENSION_LABEL: Record<IndicatorDimension, string> = {
  condition: "Condições declaradas",
  priority_need: "Necessidades prioritárias",
};

export function normalizeIndicator(payload: IndicatorResponse | undefined): NormalizedIndicator {
  const rows = payload?.data ?? payload?.buckets ?? payload?.results ?? [];
  return {
    total: payload?.total ?? null,
    threshold: payload?.suppression_threshold ?? null,
    generatedAt: payload?.generated_at ?? null,
    notice: payload?.notice ?? null,
    buckets: rows.map((row) => {
      const value = row.value ?? row.count ?? null;
      return {
        label: row.label ?? row.key ?? "Não informado",
        value: row.suppressed ? null : value,
        suppressed: Boolean(row.suppressed) || value === null,
      };
    }),
  };
}