import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Appointment, AppointmentInput, AppointmentUpdate } from "./types";

export type AppointmentListParams = {
  from?: string;
  to?: string;
  status?: string;
  project_id?: string;
  beneficiary_person_id?: string;
  professional_member_id?: string;
};

/** Converte filtros de data da interface nos timestamps estritos da API. */
export function appointmentBoundary(value: string | undefined, exclusiveEnd = false) {
  if (!value) return undefined;
  if (value.includes("T")) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // America/Sao_Paulo está em UTC-03 desde 2019; 03:00Z preserva a data civil
  // independentemente do fuso do navegador ou do servidor de build.
  const date = new Date(Date.UTC(year, month - 1, day, 3));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return undefined;
  if (exclusiveEnd) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}

export function listAppointments(params: AppointmentListParams) {
  return apiGet<{ data: Appointment[] }>("/api/v1/appointments", {
    ...params,
    from: appointmentBoundary(params.from),
    to: appointmentBoundary(params.to, true),
  });
}

export function createAppointment(input: AppointmentInput) {
  return apiPost<{ data: Appointment }>("/api/v1/appointments", input);
}

export function updateAppointment(id: string, input: AppointmentUpdate) {
  return apiPatch<{ data: Appointment }>(`/api/v1/appointments/${id}`, input);
}
