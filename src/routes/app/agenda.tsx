import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/SessionContext";
import {
  useCreateAppointment,
  useAppointments,
  useUpdateAppointment,
} from "@/features/agenda/queries";
import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_OPTIONS,
  DELIVERY_MODE_LABEL,
  type Appointment,
  type AppointmentStatus,
  type DeliveryMode,
} from "@/features/agenda/types";
import { useMembersList } from "@/features/members/queries";
import { memberDisplayName } from "@/features/members/types";
import { PersonName } from "@/features/persons/components/PersonName";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { formatDateTime, toIsoWithOffset } from "@/lib/format";

type AgendaSearch = { from: string; to: string; status: string };

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/app/agenda")({
  validateSearch: (search: Record<string, unknown>): AgendaSearch => ({
    from: typeof search["from"] === "string" ? search["from"] : dateOffset(-30),
    to: typeof search["to"] === "string" ? search["to"] : dateOffset(90),
    status: typeof search["status"] === "string" ? search["status"] : "",
  }),
  component: () => (
    <RequirePermission permission="appointment.read">
      <AgendaPage />
    </RequirePermission>
  ),
});

function AgendaPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const query = useAppointments(search);
  const appointments = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Atendimentos institucionais com controle de situação, profissional e modalidade.
          </p>
        </div>
        {can("appointment.create") ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo agendamento
          </Button>
        ) : null}
      </header>

      <section
        aria-label="Filtros da agenda"
        className="surface-card grid gap-3 rounded-2xl p-4 sm:grid-cols-3"
      >
        <label className="space-y-1 text-xs font-medium">
          De
          <Input
            type="date"
            value={search.from}
            onChange={(event) =>
              void navigate({
                search: (prev: AgendaSearch) => ({ ...prev, from: event.target.value }),
              })
            }
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Até
          <Input
            type="date"
            value={search.to}
            onChange={(event) =>
              void navigate({
                search: (prev: AgendaSearch) => ({ ...prev, to: event.target.value }),
              })
            }
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Situação
          <Select
            value={search.status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: AgendaSearch) => ({ ...prev, status: value === "ALL" ? "" : value }),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </section>

      <section aria-label="Agendamentos">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar a agenda"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento encontrado"
            description="Ajuste o período ou registre um novo atendimento."
          />
        ) : (
          <ul className="space-y-3">
            {appointments.map((item) => (
              <li
                key={item.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  <CalendarDays className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-52 flex-1">
                  <p className="font-medium">
                    <PersonName personId={item.beneficiary_person_id} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.appointment_type} • {formatDateTime(item.starts_at)} a{" "}
                    {formatDateTime(item.ends_at)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {DELIVERY_MODE_LABEL[item.delivery_mode ?? ""] ?? "Modalidade não informada"}
                </Badge>
                <Badge variant="outline">
                  {APPOINTMENT_STATUS_LABEL[item.status] ?? item.status}
                </Badge>
                {can("appointment.update") || can("appointment.confirm") ? (
                  <Button variant="outline" size="sm" onClick={() => setSelected(item)}>
                    Atualizar
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AppointmentCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AppointmentStatusDialog
        appointment={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function AppointmentCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useCreateAppointment();
  const members = useMembersList({ page: 1, limit: 100, status: "ACTIVE" }, open);
  const [personId, setPersonId] = useState("");
  const [personLabel, setPersonLabel] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mode, setMode] = useState<DeliveryMode>("IN_PERSON");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPersonId("");
    setPersonLabel("");
    setProfessionalId("");
    setAppointmentType("");
    setStartsAt("");
    setEndsAt("");
    setMode("IN_PERSON");
    setLocation("");
    setNotes("");
    setError("");
  }, [open]);

  const memberList = members.data?.data ?? [];
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const start = toIsoWithOffset(startsAt);
    const end = toIsoWithOffset(endsAt);
    if (!personId || !professionalId || !appointmentType.trim() || !start || !end) {
      setError("Preencha beneficiário, profissional, tipo, início e término.");
      return;
    }
    if (new Date(end) <= new Date(start)) {
      setError("O término deve ser posterior ao início.");
      return;
    }
    try {
      await save.mutateAsync({
        beneficiary_person_id: personId,
        professional_member_id: professionalId,
        appointment_type: appointmentType.trim(),
        starts_at: start,
        ends_at: end,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
        delivery_mode: mode,
        location_detail: location.trim() || null,
        administrative_notes: notes.trim() || null,
      });
      toast.success("Agendamento criado.");
      onOpenChange(false);
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.kind === "conflict"
          ? "Este horário conflita com outro agendamento do profissional ou beneficiário."
          : apiErrorMessage(reason),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Registre somente informações administrativas necessárias ao atendimento.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Beneficiário</Label>
            <PersonPicker
              value={personId}
              selectedLabel={personLabel}
              onChange={(id, person) => {
                setPersonId(id);
                setPersonLabel(person.full_name);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda-professional">Profissional</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger id="agenda-professional">
                <SelectValue
                  placeholder={members.isLoading ? "Carregando profissionais…" : "Selecione"}
                />
              </SelectTrigger>
              <SelectContent>
                {memberList.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {memberDisplayName(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Tipo de atendimento
              <Input
                value={appointmentType}
                onChange={(event) => setAppointmentType(event.target.value)}
                maxLength={120}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Modalidade
              <Select value={mode} onValueChange={(value) => setMode(value as DeliveryMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DELIVERY_MODE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Início
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Término
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            Local ou link
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={500}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Observações administrativas
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentStatusDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { can } = useSession();
  const save = useUpdateAppointment();
  const [status, setStatus] = useState<AppointmentStatus>("SCHEDULED");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status as AppointmentStatus);
      setNotes(
        appointment.cancellation_reason ??
          appointment.no_show_notes ??
          appointment.confirmation_notes ??
          "",
      );
    }
  }, [appointment]);
  const noteLabel =
    status === "CANCELLED"
      ? "Motivo do cancelamento"
      : status === "NO_SHOW"
        ? "Registro de ausência"
        : "Observação de confirmação";
  const allowedStatuses = APPOINTMENT_STATUS_OPTIONS.filter((option) =>
    option.value === "CONFIRMED" ? can("appointment.confirm") : can("appointment.update"),
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!appointment) return;
    if ((status === "CANCELLED" || status === "NO_SHOW") && !notes.trim()) {
      toast.error("Informe o motivo para esta situação.");
      return;
    }
    const input = {
      status,
      ...(status === "CANCELLED"
        ? { cancellation_reason: notes.trim() }
        : status === "NO_SHOW"
          ? { no_show_notes: notes.trim() }
          : { confirmation_notes: notes.trim() || null }),
    };
    try {
      await save.mutateAsync({ id: appointment.id, input });
      toast.success("Agendamento atualizado.");
      onOpenChange(false);
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar agendamento</DialogTitle>
          <DialogDescription>
            {appointment
              ? `${appointment.appointment_type} • ${formatDateTime(appointment.starts_at)}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="agenda-status">Situação</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as AppointmentStatus);
                setNotes("");
              }}
            >
              <SelectTrigger id="agenda-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="space-y-2 text-sm font-medium">
            {noteLabel}
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
