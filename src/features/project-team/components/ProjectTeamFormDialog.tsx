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
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { toDateInput, todayInput } from "@/lib/format";
import { useSaveProjectTeamMember } from "../queries";
import { ROLE_TITLE_MAX_LENGTH, teamPersonName, type ProjectTeamMember } from "../types";

export function ProjectTeamFormDialog({
  projectId,
  open,
  onOpenChange,
  entry,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ProjectTeamMember | null;
}) {
  const editing = Boolean(entry);
  const save = useSaveProjectTeamMember(projectId);

  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [startsAt, setStartsAt] = useState(todayInput());
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setPersonId(entry?.person_id ?? "");
    setPersonName(entry ? teamPersonName(entry) : null);
    setRoleTitle(entry?.role_title ?? "");
    setStartsAt(entry ? toDateInput(entry.starts_at) || todayInput() : todayInput());
    setEndsAt(entry ? toDateInput(entry.ends_at) : "");
    setNotes(entry?.notes ?? "");
  }, [open, entry]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!editing && !personId) nextErrors["person_id"] = "Selecione a pessoa a ser vinculada.";
    if (!roleTitle.trim()) nextErrors["role_title"] = "Informe a função nesta equipe.";
    if (roleTitle.trim().length > ROLE_TITLE_MAX_LENGTH)
      nextErrors["role_title"] = `Use no máximo ${ROLE_TITLE_MAX_LENGTH} caracteres.`;
    if (endsAt && startsAt && endsAt < startsAt)
      nextErrors["ends_at"] = "O encerramento não pode ser anterior ao início.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const shared = {
        role_title: roleTitle.trim(),
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        notes: notes.trim() || null,
      };
      if (editing && entry) {
        await save.mutateAsync({ mode: "update", teamMemberId: entry.id, input: shared });
      } else {
        await save.mutateAsync({ mode: "create", input: { person_id: personId, ...shared } });
      }
      toast.success(editing ? "Participação atualizada." : "Membro incluído na equipe.");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar participação" : "Incluir na equipe"}</DialogTitle>
          <DialogDescription>
            A participação é temporal: informe o início e, quando houver, o encerramento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editing ? (
            <p className="text-sm text-muted-foreground">
              Pessoa:{" "}
              <span className="font-medium text-foreground">
                {personName ?? "não identificada"}
              </span>
            </p>
          ) : (
            <FormField id="team-person" label="Pessoa" error={errors["person_id"]}>
              <PersonPicker
                value={personId}
                selectedLabel={personName}
                onChange={(id, person) => {
                  setPersonId(id);
                  setPersonName(person.full_name ?? null);
                }}
              />
            </FormField>
          )}

          <FormField
            id="team-role"
            label="Função na equipe"
            error={errors["role_title"]}
            hint="Texto livre, como “Coordenação” ou “Psicóloga responsável”."
          >
            <Input
              id="team-role"
              value={roleTitle}
              maxLength={ROLE_TITLE_MAX_LENGTH}
              onChange={(event) => setRoleTitle(event.target.value)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="team-starts" label="Início" error={errors["starts_at"]}>
              <Input
                id="team-starts"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </FormField>
            <FormField
              id="team-ends"
              label="Encerramento"
              error={errors["ends_at"]}
              hint="Deixe vazio para participação em curso."
            >
              <Input
                id="team-ends"
                type="date"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="team-notes" label="Observações" error={errors["notes"]}>
            <Textarea
              id="team-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
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
