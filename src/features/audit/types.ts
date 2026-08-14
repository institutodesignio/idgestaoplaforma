export type AuditEvent = {
  id: string;
  action: string | null;
  event_type?: string | null;
  resource_type: string | null;
  resource_id: string | null;
  actor_id?: string | null;
  actor?: { id?: string; email?: string | null; full_name?: string | null } | null;
  actor_email?: string | null;
  ip_address?: string | null;
  created_at: string | null;
  occurred_at?: string | null;
};

export const AUDIT_RESOURCE_OPTIONS = [
  { value: "person", label: "Pessoas" },
  { value: "project", label: "Projetos" },
  { value: "unit", label: "Unidades" },
  { value: "member", label: "Membros" },
  { value: "clinical_supervision_case", label: "Supervisão clínica" },
  { value: "neurodivergent_intake", label: "Cadastro neurodivergente" },
  { value: "care_request", label: "Demandas" },
  { value: "privacy_request", label: "Privacidade" },
];

export function auditActor(event: AuditEvent): string {
  return event.actor?.full_name ?? event.actor?.email ?? event.actor_email ?? "Sistema";
}

export function auditAction(event: AuditEvent): string {
  return event.action ?? event.event_type ?? "—";
}

export function auditDate(event: AuditEvent): string | null {
  return event.created_at ?? event.occurred_at ?? null;
}