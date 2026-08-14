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
import { useSession } from "@/contexts/SessionContext";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { useMembersList } from "@/features/members/queries";
import { memberDisplayName } from "@/features/members/types";
import { useProjectsList } from "@/features/projects/queries";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { toDateInput, todayInput } from "@/lib/format";
import { useCreateSupervisionCase, useUpdateSupervisionCase } from "../queries";
import {
  SUPERVISION_CASE_STATUS_OPTIONS,
  casePersonName,
  type SupervisionCase,
  type SupervisionCaseStatus,
} from "../types";

export function SupervisionCaseDialog({
  open,
  onOpenChange,
  supervisionCase,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisionCase?: SupervisionCase | null;
  onCreated?: (caseId: string) => void;
}) {
  const editing = Boolean(supervisionCase);
  const { can } = useSession();
  const create = useCreateSupervisionCase();
  const update = useUpdateSupervisionCase(supervisionCase?.id ?? "");
  const membersQuery = useMembersList({ page: 1, limit: 100 }, open);
  const projectsQuery = useProjectsList(
    { page: 1, limit: 100, search: "", status: "ACTIVE" },
    open && can("project.read"),
  );

  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [responsible, setResponsible] = useState("");
  const [status, setStatus] = useState<SupervisionCaseStatus>("OPEN");
  const [openedAt, setOpenedAt] = useState(todayInput());
  const [summary, setSummary] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setPersonId(supervisionCase?.person_id ?? "");
    setPersonName(supervisionCase ? casePersonName(supervisionCase) : null);
    setProjectId(supervisionCase?.project_id ?? "");
    setResponsible(supervisionCase?.technical_responsible_member_id ?? "");
    setStatus((supervisionCase?.status as SupervisionCaseStatus) ?? "OPEN");
    setOpenedAt(
      supervisionCase ? toDateInput(supervisionCase.opened_at) || todayInput() : todayInput(),
    );
    setSummary(supervisionCase?.summary ?? "");
  }, [open, supervisionCase]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!personId) nextErrors["person_id"] = "Selecione a pessoa acompanhada.";
    if (!responsible)
      nextErrors["technical_responsible_member_id"] = "Indique o Responsável Técnico do caso.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      person_id: personId,
      project_id: projectId || null,
      technical_responsible_member_id: responsible,
      status,
      opened_at: openedAt || null,
      summary: summary.trim() || null,
    };

    try {
      if (editing) {
        await update.mutateAsync(payload);
        toast.success("Caso atualizado.");
      } else {
        const result = await create.mutateAsync(payload);
        toast.success("Caso aberto para supervisão.");
        if (result?.case?.id) onCreated?.(result.case.id);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const members = membersQuery.data?.data ?? [];
  const projects = projectsQuery.data?.data ?? [];
  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Atualizar caso" : "Abrir caso de supervisão"}</DialogTitle>
          <DialogDescription>
            Registre apenas o essencial para organizar a supervisão. Conteúdo clínico detalhado
            pertence às sessões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editing ? (
            <p className="text-sm text-muted-foreground">
              Pessoa acompanhada:{" "}
              <span className="font-medium text-foreground">{personName}</span>
            </p>
          ) : (
            <FormField id="case-person" label="Pessoa acompanhada" error={errors["person_id"]}>
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
            id="case-responsible"
            label="Responsável Técnico"
            error={errors["technical_responsible_member_id"]}
          >
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger id="case-responsible">
                <SelectValue placeholder="Selecione o Responsável Técnico" />
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

          {projects.length > 0 ? (
            <FormField id="case-project" label="Projeto" error={errors["project_id"]} hint="Opcional.">
              <Select
                value={projectId || "NONE"}
                onValueChange={(value) => setProjectId(value === "NONE" ? "" : value)}
              >
                <SelectTrigger id="case-project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sem projeto definido</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="case-status" label="Situação" error={errors["status"]}>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as SupervisionCaseStatus)}
              >
                <SelectTrigger id="case-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISION_CASE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="case-opened" label="Abertura" error={errors["opened_at"]}>
              <Input
                id="case-opened"
                type="date"
                value={openedAt}
                onChange={(event) => setOpenedAt(event.target.value)}
              />
            </FormField>
          </div>

          <FormField
            id="case-summary"
            label="Resumo institucional"
            error={errors["summary"]}
            hint="Objetivo da supervisão, sem detalhes clínicos sensíveis."
          >
            <Textarea
              id="case-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={() => void handleSubmit()}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}