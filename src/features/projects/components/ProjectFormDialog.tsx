import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { FormField } from "@/features/persons/components/FormField";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { unwrapProject } from "../api";
import { useSaveProject } from "../queries";
import {
  PROJECT_STATUS_OPTIONS,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "../types";

type FormState = {
  name: string;
  slug: string;
  short_name: string;
  description: string;
  status: ProjectStatus;
  starts_at: string;
  ends_at: string;
  has_clinical_care: boolean;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  short_name: "",
  description: "",
  status: "PLANNING",
  starts_at: "",
  ends_at: "",
  has_clinical_care: false,
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSaved?: (projectId?: string) => void;
}) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveProject(project?.id);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState(
      project
        ? {
            name: project.name ?? "",
            slug: project.slug ?? "",
            short_name: project.short_name ?? "",
            description: project.description ?? "",
            status: (project.status as ProjectStatus) ?? "PLANNING",
            starts_at: project.starts_at ? project.starts_at.slice(0, 10) : "",
            ends_at: project.ends_at ? project.ends_at.slice(0, 10) : "",
            has_clinical_care: Boolean(project.has_clinical_care),
          }
        : EMPTY,
    );
  }, [open, project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;

    const nextErrors: Record<string, string> = {};
    if (!state.name.trim()) nextErrors["name"] = "Informe o nome do projeto.";
    if (state.starts_at && state.ends_at && state.ends_at < state.starts_at) {
      nextErrors["ends_at"] = "O término deve ser posterior ao início.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const nullable = (value: string) => (value.trim() === "" ? null : value.trim());
    const input: ProjectInput = {
      name: state.name.trim(),
      slug: nullable(state.slug),
      short_name: nullable(state.short_name),
      description: nullable(state.description),
      status: state.status,
      starts_at: nullable(state.starts_at),
      ends_at: nullable(state.ends_at),
      has_clinical_care: state.has_clinical_care,
    };

    try {
      const result = await save.mutateAsync(input);
      toast.success(project ? "Projeto atualizado." : "Projeto criado.");
      onOpenChange(false);
      onSaved?.(unwrapProject(result as never)?.id);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>Projetos institucionais do Instituto Designio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="name" label="Nome" error={errors["name"]}>
              <Input
                id="name"
                value={state.name}
                onChange={(event) => set("name", event.target.value)}
                maxLength={160}
              />
            </FormField>

            <FormField id="short_name" label="Nome curto" error={errors["short_name"]}>
              <Input
                id="short_name"
                value={state.short_name}
                onChange={(event) => set("short_name", event.target.value)}
                maxLength={60}
              />
            </FormField>

            <FormField id="slug" label="Identificador (slug)" error={errors["slug"]}>
              <Input
                id="slug"
                value={state.slug}
                onChange={(event) => set("slug", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="status" label="Situação" error={errors["status"]}>
              <Select
                value={state.status}
                onValueChange={(value) => set("status", value as ProjectStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="starts_at" label="Início" error={errors["starts_at"]}>
              <Input
                id="starts_at"
                type="date"
                value={state.starts_at}
                onChange={(event) => set("starts_at", event.target.value)}
              />
            </FormField>

            <FormField id="ends_at" label="Término" error={errors["ends_at"]}>
              <Input
                id="ends_at"
                type="date"
                value={state.ends_at}
                onChange={(event) => set("ends_at", event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="description" label="Descrição" error={errors["description"]}>
            <Textarea
              id="description"
              value={state.description}
              onChange={(event) => set("description", event.target.value)}
              rows={3}
              maxLength={800}
            />
          </FormField>

          <div className="flex items-start gap-2">
            <Checkbox
              id="has_clinical_care"
              checked={state.has_clinical_care}
              onCheckedChange={(checked) => set("has_clinical_care", checked === true)}
            />
            <Label
              htmlFor="has_clinical_care"
              className="text-sm font-normal text-muted-foreground"
            >
              Este projeto possui atendimento clínico.
            </Label>
          </div>

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
