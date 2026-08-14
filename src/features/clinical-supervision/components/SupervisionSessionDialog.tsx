import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/persons/components/FormField";
import { useMembersList } from "@/features/members/queries";
import { memberDisplayName } from "@/features/members/types";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { toDateTimeInput } from "@/lib/format";
import { useSaveSupervisionSession } from "../queries";
import {
  SUPERVISION_MODALITY_OPTIONS,
  SUPERVISION_SESSION_STATUS_OPTIONS,
  type SupervisionSession,
  type SupervisionSessionStatus,
} from "../types";

export function SupervisionSessionDialog({
  caseId,
  open,
  onOpenChange,
  session,
}: {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: SupervisionSession | null;
}) {
  const editing = Boolean(session);
  const save = useSaveSupervisionSession(caseId);
  const membersQuery = useMembersList({ page: 1, limit: 100 }, open);

  const [scheduledAt, setScheduledAt] = useState("");
  const [modality, setModality] = useState("IN_PERSON");
  const [status, setStatus] = useState<SupervisionSessionStatus>("SCHEDULED");
  const [supervisor, setSupervisor] = useState("");
  const [agenda, setAgenda] = useState("");
  const [deliberations, setDeliberations] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setScheduledAt(toDateTimeInput(session?.scheduled_at ?? null));
    setModality(session?.modality ?? "IN_PERSON");
    setStatus((session?.status as SupervisionSessionStatus) ?? "SCHEDULED");
    setSupervisor(session?.supervisor_member_id ?? "");
    setAgenda(session?.agenda ?? "");
    setDeliberations(session?.deliberations ?? "");
  }, [open, session]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!scheduledAt) nextErrors["scheduled_at"] = "Informe a data e hora da sessão.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const iso = new Date(scheduledAt).toISOString();

    try {
      await save.mutateAsync({
        ...(editing && session?.id ? { sessionId: session.id } : {}),
        input: {
          scheduled_at: iso,
          modality,
          status,
          supervisor_member_id: supervisor || null,
          agenda: agenda.trim() || null,
          ...(editing
            ? {
                deliberations: deliberations.trim() || null,
                held_at: status === "HELD" ? iso : null,
              }
            : {}),
        },
      });
      toast.success(editing ? "Sessão atualizada." : "Sessão registrada.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const members = membersQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Atualizar sessão" : "Nova sessão de supervisão"}</DialogTitle>
          <DialogDescription>
            Registre agenda e deliberações da supervisão de forma objetiva e respeitosa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="session-date" label="Data e hora" error={errors["scheduled_at"]}>
              <Input
                id="session-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            </FormField>
            <FormField id="session-modality" label="Modalidade" error={errors["modality"]}>
              <Select value={modality} onValueChange={setModality}>
                <SelectTrigger id="session-modality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISION_MODALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField id="session-status" label="Situação" error={errors["status"]}>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as SupervisionSessionStatus)}
            >
              <SelectTrigger id="session-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPERVISION_SESSION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="session-supervisor"
            label="Supervisor"
            error={errors["supervisor_member_id"]}
            hint="Opcional."
          >
            <Select
              value={supervisor || "NONE"}
              onValueChange={(value) => setSupervisor(value === "NONE" ? "" : value)}
            >
              <SelectTrigger id="session-supervisor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Não definido</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {memberDisplayName(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="session-agenda" label="Pauta" error={errors["agenda"]}>
            <Textarea
              id="session-agenda"
              value={agenda}
              onChange={(event) => setAgenda(event.target.value)}
              rows={3}
            />
          </FormField>

          {editing ? (
            <FormField
              id="session-deliberations"
              label="Deliberações"
              error={errors["deliberations"]}
            >
              <Textarea
                id="session-deliberations"
                value={deliberations}
                onChange={(event) => setDeliberations(event.target.value)}
                rows={4}
              />
            </FormField>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={save.isPending} onClick={() => void handleSubmit()}>
            {save.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
