import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  type AppointmentListParams,
} from "./api";
import type { AppointmentInput, AppointmentUpdate } from "./types";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: AppointmentListParams) => ["appointments", "list", params] as const,
};

export function useAppointments(params: AppointmentListParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => listAppointments(params),
    retry: false,
  });
}

export function useCreateAppointment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentInput) => createAppointment(input),
    onSuccess: () => client.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}

export function useUpdateAppointment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AppointmentUpdate }) =>
      updateAppointment(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}
