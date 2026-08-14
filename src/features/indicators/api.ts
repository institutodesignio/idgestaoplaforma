import { apiGet } from "@/lib/api";
import type { IndicatorDimension, IndicatorResponse } from "./types";

export function getNeurodivergentPopulationIndicator(dimension: IndicatorDimension) {
  return apiGet<IndicatorResponse>("/api/v1/indicators/neurodivergent-population", { dimension });
}