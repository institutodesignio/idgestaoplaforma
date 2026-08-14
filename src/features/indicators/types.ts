/** Agregado protegido: o backend define o tamanho mínimo de grupo e não devolve dados identificados. */
export type IndicatorDimension = "condition" | "priority_need";

export type IndicatorBucket = {
  key?: string | null;
  label?: string | null;
  value?: number | null;
  count?: number | null;
};

export type IndicatorPrivacy = {
  minimum_group_size?: number | null;
  identified_data?: boolean | null;
};

export type IndicatorResponse = {
  data?: IndicatorBucket[];
  privacy?: IndicatorPrivacy;
};

export type NormalizedIndicator = {
  minimumGroupSize: number | null;
  identifiedData: boolean;
  buckets: { label: string; value: number }[];
};

export const DIMENSION_LABEL: Record<IndicatorDimension, string> = {
  condition: "Condições declaradas",
  priority_need: "Necessidades prioritárias",
};

export function normalizeIndicator(payload: IndicatorResponse | undefined): NormalizedIndicator {
  const rows = payload?.data ?? [];
  return {
    minimumGroupSize: payload?.privacy?.minimum_group_size ?? null,
    identifiedData: Boolean(payload?.privacy?.identified_data),
    buckets: rows.map((row) => ({
      label: row.label ?? row.key ?? "Não informado",
      value: row.value ?? row.count ?? 0,
    })),
  };
}
