export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type DeliveryMode = "IN_PERSON" | "REMOTE" | "HYBRID";

export type Appointment = {
  id: string;
  beneficiary_person_id: string;
  professional_member_id: string;
  appointment_type: string;
  starts_at: string;
  ends_at: string;
  timezone?: string | null;
  status: AppointmentStatus | string;
  delivery_mode?: DeliveryMode | null;
  location_detail?: string | null;
  administrative_notes?: string | null;
  confirmation_notes?: string | null;
  cancellation_reason?: string | null;
  no_show_notes?: string | null;
  project_id?: string | null;
  unit_id?: string | null;
  care_request_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AppointmentInput = {
  beneficiary_person_id: string;
  professional_member_id: string;
  appointment_type: string;
  starts_at: string;
  ends_at: string;
  timezone?: string;
  delivery_mode?: DeliveryMode;
  location_detail?: string | null;
  administrative_notes?: string | null;
};

export type AppointmentUpdate = {
  status?: AppointmentStatus;
  confirmation_notes?: string | null;
  cancellation_reason?: string | null;
  no_show_notes?: string | null;
};

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

export const APPOINTMENT_STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const DELIVERY_MODE_LABEL: Record<string, string> = {
  IN_PERSON: "Presencial",
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
};
