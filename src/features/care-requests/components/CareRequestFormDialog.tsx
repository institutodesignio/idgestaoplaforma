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
import { useProjectsList } from "@/features/projects/queries";
import { useSession } from "@/contexts/SessionContext";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useCreateCareRequest } from "../queries";
import { CARE_REQUEST_PRIORITY_OPTIONS, type CareRequestPriority } from "../types";

export function CareRequestFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { can } = useSession();
  const create = useCreateCareRequest();
  const projectsQuery = useProjectsList(
    { page: 1, limit: 100, search: "", status: "ACTIVE" },
    open && can("project.read"),
  );

  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<CareRequestPriority>("NORMAL");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) return;
    setPersonId("");
    setPersonName(null);
    setProjectId("");
    setCategory("");
    setPriority("NORMAL");
    setDescription("");
    setErrors({});
  }, [open]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!personId) nextErrors["person_id"] = "Selecione a pessoa desta demanda.";
    if (!category.trim()) nextErrors["category"] = "Informe a categoria da demanda.";
    if (!description.trim()) nextErrors["description"] = "Descreva a demanda.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await create.mutateAsync({
        person_id: personId,
        project_id: projectId || null,
        category: category.trim(),
        description: description.trim(),
        priority,
      });
      toast.success("Demanda registrada.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  const projects = projectsQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova demanda</DialogTitle>
          <DialogDescription>
            Registre a solicitação de cuidado para acompanhamento e encaminhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField id="care-person" label="Pessoa" error={errors["person_id"]}>
            <PersonPicker
              value={personId}
              selectedLabel={personName}
              onChange={(id, person) => {
                setPersonId(id);
                setPersonName(person.full_name ?? null);
              }}
            />
          </FormField>

          {projects.length > 0 ? (
            <FormField
              id="care-project"
              label="Projeto relacionado"
              error={errors["project_id"]}
              hint="Opcional."
            >
              <Select
                value={projectId || "NONE"}
                onValueChange={(value) => setProjectId(value === "NONE" ? "" : value)}
              >
                <SelectTrigger id="care-project">
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

          <FormField id="care-category" label="Categoria da demanda" error={errors["category"]}>
            <Input
              id="care-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ex.: avaliação inicial, orientação familiar"
            />
          </FormField>

          <FormField id="care-priority" label="Prioridade" error={errors["priority"]}>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as CareRequestPriority)}
            >
              <SelectTrigger id="care-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARE_REQUEST_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="care-description"
            label="Descrição"
            error={errors["description"]}
            hint="Registre apenas o necessário para organizar o acolhimento."
          >
            <Textarea
              id="care-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={create.isPending} onClick={() => void handleSubmit()}>
            {create.isPending ? "Registrando…" : "Registrar demanda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
