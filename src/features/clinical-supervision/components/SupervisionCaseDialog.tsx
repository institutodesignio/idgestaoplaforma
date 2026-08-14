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
import { useProjectsList } from "@/features/projects/queries";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useCreateSupervisionCase, useUpdateSupervisionCase } from "../queries";
import {
  SUPERVISION_CASE_STATUS_OPTIONS,
  SUPERVISION_PRIORITY_OPTIONS,
  type SupervisionCase,
  type SupervisionCaseStatus,
  type SupervisionPriority,
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
  const projectsQuery = useProjectsList(
    { page: 1, limit: 100, search: "", status: "ACTIVE" },
    open && can("project.read"),
  );

  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState<string | null>(null);
  const [technicalId, setTechnicalId] = useState("");
  const [technicalName, setTechnicalName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<SupervisionPriority>("NORMAL");
  const [status, setStatus] = useState<SupervisionCaseStatus>("OPEN");
  const [summary, setSummary] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setBeneficiaryId(supervisionCase?.beneficiary_person_id ?? "");
    setBeneficiaryName(null);
    setTechnicalId(supervisionCase?.assigned_technical_person_id ?? "");
    setTechnicalName(null);
    setProjectId(supervisionCase?.project_id ?? "");
    setPriority((supervisionCase?.priority as SupervisionPriority) ?? "NORMAL");
    setStatus((supervisionCase?.status as SupervisionCaseStatus) ?? "OPEN");
    setSummary(supervisionCase?.summary ?? "");
  }, [open, supervisionCase]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!summary.trim()) nextErrors["summary"] = "Descreva o objetivo do acompanhamento.";
    if (!editing) {
      if (!beneficiaryId) nextErrors["beneficiary_person_id"] = "Selecione a pessoa acompanhada.";
      if (!projectId) nextErrors["project_id"] = "Selecione o projeto responsável pelo caso.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      if (editing) {
        await update.mutateAsync({
          assigned_technical_person_id: technicalId || null,
          priority,
          status,
          summary: summary.trim(),
        });
        toast.success("Caso atualizado.");
      } else {
        const result = await create.mutateAsync({
          project_id: projectId,
          beneficiary_person_id: beneficiaryId,
          assigned_technical_person_id: technicalId || null,
          priority,
          summary: summary.trim(),
        });
        toast.success("Caso aberto para supervisão.");
        if (result?.data?.id) onCreated?.(result.data.id);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const projects = projectsQuery.data?.data ?? [];
  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Atualizar caso" : "Abrir caso de supervisão"}</DialogTitle>
          <DialogDescription>
            Registre apenas o essencial para organizar a supervisão. Conteúdo clínico detalhado
            pertence às sessões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editing ? null : (
            <>
              <FormField
                id="case-beneficiary"
                label="Pessoa acompanhada"
                error={errors["beneficiary_person_id"]}
              >
                <PersonPicker
                  value={beneficiaryId}
                  selectedLabel={beneficiaryName}
                  onChange={(id, person) => {
                    setBeneficiaryId(id);
                    setBeneficiaryName(person.full_name ?? null);
                  }}
                />
              </FormField>

              <FormField id="case-project" label="Projeto" error={errors["project_id"]}>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="case-project">
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}

          <FormField
            id="case-technical"
            label="Responsável Técnico"
            error={errors["assigned_technical_person_id"]}
            hint="Opcional. Selecione a pessoa responsável pelo caso."
          >
            <PersonPicker
              value={technicalId}
              selectedLabel={technicalName}
              onChange={(id, person) => {
                setTechnicalId(id);
                setTechnicalName(person.full_name ?? null);
              }}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="case-priority" label="Prioridade" error={errors["priority"]}>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as SupervisionPriority)}
              >
                <SelectTrigger id="case-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISION_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {editing ? (
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
            ) : null}
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
