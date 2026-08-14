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
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { toDateTimeInput, toIsoWithOffset } from "@/lib/format";
import { useSaveSupervisionSession } from "../queries";
import {
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

  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<SupervisionSessionStatus>("SCHEDULED");
  const [supervisorId, setSupervisorId] = useState("");
  const [supervisorName, setSupervisorName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setScheduledAt(toDateTimeInput(session?.scheduled_at ?? null));
    setStatus((session?.status as SupervisionSessionStatus) ?? "SCHEDULED");
    setSupervisorId(session?.supervisor_person_id ?? "");
    setSupervisorName(null);
    setNotes(session?.notes ?? "");
  }, [open, session]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!scheduledAt) nextErrors["scheduled_at"] = "Informe a data e hora da sessão.";
    if (!editing && !supervisorId)
      nextErrors["supervisor_person_id"] = "Selecione a pessoa supervisora.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const iso = toIsoWithOffset(scheduledAt);
    if (!iso) {
      setErrors({ scheduled_at: "Data e hora inválidas." });
      return;
    }

    try {
      if (editing && session?.id) {
        await save.mutateAsync({
          mode: "update",
          sessionId: session.id,
          input: { scheduled_at: iso, status, notes: notes.trim() || null },
        });
      } else {
        await save.mutateAsync({
          mode: "create",
          input: {
            supervisor_person_id: supervisorId,
            scheduled_at: iso,
            notes: notes.trim() || null,
          },
        });
      }
      toast.success(editing ? "Sessão atualizada." : "Sessão registrada.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Atualizar sessão" : "Nova sessão de supervisão"}</DialogTitle>
          <DialogDescription>
            Registre data, situação e observações da supervisão de forma objetiva e respeitosa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField id="session-date" label="Data e hora" error={errors["scheduled_at"]}>
            <Input
              id="session-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </FormField>

          {editing ? (
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
          ) : (
            <FormField
              id="session-supervisor"
              label="Pessoa supervisora"
              error={errors["supervisor_person_id"]}
            >
              <PersonPicker
                value={supervisorId}
                selectedLabel={supervisorName}
                onChange={(id, person) => {
                  setSupervisorId(id);
                  setSupervisorName(person.full_name ?? null);
                }}
              />
            </FormField>
          )}

          <FormField
            id="session-notes"
            label="Observações"
            error={errors["notes"]}
            hint="Pauta e deliberações registradas de forma objetiva."
          >
            <Textarea
              id="session-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </FormField>
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
