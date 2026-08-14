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
import { toDateInput, todayInput } from "@/lib/format";
import { useSaveProjectTeamMember } from "../queries";
import { PROJECT_ROLE_OPTIONS, teamRoleCode, type ProjectTeamMember } from "../types";

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
  const membersQuery = useMembersList({ page: 1, limit: 100, status: "" }, open && !editing);

  const [memberId, setMemberId] = useState("");
  const [projectRole, setProjectRole] = useState("PROFESSIONAL");
  const [startsAt, setStartsAt] = useState(todayInput());
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setMemberId(entry?.member_id ?? "");
    setProjectRole(entry ? teamRoleCode(entry) || "PROFESSIONAL" : "PROFESSIONAL");
    setStartsAt(entry ? toDateInput(entry.starts_at) || todayInput() : todayInput());
    setEndsAt(entry ? toDateInput(entry.ends_at) : "");
    setNotes(entry?.notes ?? "");
  }, [open, entry]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!memberId) nextErrors["member_id"] = "Selecione um membro da equipe institucional.";
    if (!startsAt) nextErrors["starts_at"] = "Informe a data de início.";
    if (endsAt && startsAt && endsAt < startsAt)
      nextErrors["ends_at"] = "O encerramento não pode ser anterior ao início.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await save.mutateAsync({
        ...(editing ? { memberId } : {}),
        input: {
          member_id: memberId,
          project_role: projectRole,
          starts_at: startsAt,
          ends_at: endsAt || null,
          notes: notes.trim() || null,
        },
      });
      toast.success(editing ? "Participação atualizada." : "Membro incluído na equipe.");
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
          <DialogTitle>{editing ? "Editar participação" : "Incluir na equipe"}</DialogTitle>
          <DialogDescription>
            A participação é temporal: informe o início e, quando houver, o encerramento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editing ? (
            <p className="text-sm text-muted-foreground">
              Membro:{" "}
              <span className="font-medium text-foreground">
                {entry?.full_name ?? entry?.member?.full_name ?? entry?.email ?? memberId}
              </span>
            </p>
          ) : (
            <FormField id="team-member" label="Membro institucional" error={errors["member_id"]}>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger id="team-member">
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {memberDisplayName(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField id="team-role" label="Papel no projeto" error={errors["project_role"]}>
            <Select value={projectRole} onValueChange={setProjectRole}>
              <SelectTrigger id="team-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
