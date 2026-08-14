import { useQuery } from "@tanstack/react-query";
import { getNeurodivergentPopulationIndicator } from "./api";
import { normalizeIndicator, type IndicatorDimension } from "./types";

export const indicatorKeys = {
  population: (dimension: IndicatorDimension) =>
    ["indicators", "neurodivergent-population", dimension] as const,
};

export function useNeurodivergentIndicator(dimension: IndicatorDimension, enabled = true) {
  return useQuery({
    queryKey: indicatorKeys.population(dimension),
    queryFn: async () => normalizeIndicator(await getNeurodivergentPopulationIndicator(dimension)),
    enabled,
    retry: false,
  });
}