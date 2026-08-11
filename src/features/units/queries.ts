import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
  unwrapUnit,
  type UnitsListParams,
} from "./api";
import type { UnitInput } from "./types";

export const unitKeys = {
  all: ["units"] as const,
  list: (params: UnitsListParams) => ["units", "list", params] as const,
  detail: (id: string) => ["units", "detail", id] as const,
};

export function useUnitsList(params: UnitsListParams, enabled = true) {
  return useQuery({
    queryKey: unitKeys.list(params),
    queryFn: () => listUnits(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useUnit(id: string, enabled = true) {
  return useQuery({
    queryKey: unitKeys.detail(id),
    queryFn: async () => unwrapUnit(await getUnit(id)),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export function useSaveUnit(unitId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnitInput) => (unitId ? updateUnit(unitId, input) : createUnit(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => deleteUnit(unitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  });
}