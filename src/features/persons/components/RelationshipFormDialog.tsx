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
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useSaveRelationship } from "../queries";
import {
  RELATIONSHIP_TYPE_OPTIONS,
  type PersonRelationship,
  type RelationshipInput,
} from "../types";
import { FormField } from "./FormField";
import { PersonPicker } from "./PersonPicker";

type FormState = {
  related_person_id: string;
  related_person_label: string;
  relationship_type: string;
  is_legal_guardian: boolean;
  is_financial_responsible: boolean;
  starts_at: string;
  ends_at: string;
  notes: string;
};

const EMPTY: FormState = {
  related_person_id: "",
  related_person_label: "",
  relationship_type: "GUARDIAN",
  is_legal_guardian: false,
  is_financial_responsible: false,
  starts_at: "",
  ends_at: "",
  notes: "",
};

export function RelationshipFormDialog({
  open,
  onOpenChange,
  personId,
  relationship,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  relationship?: PersonRelationship | null;
}) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveRelationship(personId);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState(
      relationship
        ? {
            related_person_id: relationship.related_person_id ?? "",
            related_person_label: relationship.related_person?.full_name ?? "",
            relationship_type: relationship.relationship_type ?? "GUARDIAN",
            is_legal_guardian: Boolean(relationship.is_legal_guardian),
            is_financial_responsible: Boolean(relationship.is_financial_responsible),
            starts_at: relationship.starts_at ? String(relationship.starts_at).slice(0, 10) : "",
            ends_at: relationship.ends_at ? String(relationship.ends_at).slice(0, 10) : "",
            notes: relationship.notes ?? "",
          }
        : EMPTY,
    );
  }, [open, relationship]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;

    const nextErrors: Record<string, string> = {};
    if (!state.related_person_id) {
      nextErrors['related_person_id'] = "Selecione a pessoa relacionada.";
    }
    if (state.related_person_id === personId) {
      nextErrors['related_person_id'] = "Não é possível vincular a pessoa a si mesma.";
    }
    if (!state.relationship_type) {
      nextErrors['relationship_type'] = "Selecione o tipo de vínculo.";
    }
    if (state.starts_at && state.ends_at && state.ends_at < state.starts_at) {
      nextErrors['ends_at'] = "O término deve ser posterior ao início.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const input: RelationshipInput = {
      related_person_id: state.related_person_id,
      relationship_type: state.relationship_type,
      is_legal_guardian: state.is_legal_guardian,
      is_financial_responsible: state.is_financial_responsible,
      starts_at: state.starts_at.trim() === "" ? null : state.starts_at,
      ends_at: state.ends_at.trim() === "" ? null : state.ends_at,
      notes: state.notes.trim() === "" ? null : state.notes.trim(),
    };

    try {
      await save.mutateAsync(
        relationship ? { relationshipId: relationship.id, input } : { input },
      );
      toast.success(relationship ? "Vínculo atualizado." : "Vínculo adicionado.");
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{relationship ? "Editar vínculo" : "Adicionar vínculo"}</DialogTitle>
          <DialogDescription>
            Vínculos e responsáveis registrados no backend institucional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            id="related_person_id"
            label="Pessoa relacionada"
            error={errors['related_person_id']}
          >
            <PersonPicker
              value={state.related_person_id}
              excludeId={personId}
              selectedLabel={state.related_person_label}
              onChange={(id, person) =>
                setState((prev) => ({
                  ...prev,
                  related_person_id: id,
                  related_person_label: person.full_name,
                }))
              }
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="relationship_type"
              label="Tipo de vínculo"
              error={errors['relationship_type']}
            >
              <Select
                value={state.relationship_type}
                onValueChange={(value) => set("relationship_type", value)}
              >
                <SelectTrigger id="relationship_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="starts_at" label="Início" error={errors['starts_at']}>
              <Input
                id="starts_at"
                type="date"
                value={state.starts_at}
                onChange={(event) => set("starts_at", event.target.value)}
              />
            </FormField>

            <FormField id="ends_at" label="Término" error={errors['ends_at']}>
              <Input
                id="ends_at"
                type="date"
                value={state.ends_at}
                onChange={(event) => set("ends_at", event.target.value)}
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_legal_guardian"
                checked={state.is_legal_guardian}
                onCheckedChange={(checked) => set("is_legal_guardian", checked === true)}
              />
              <Label htmlFor="is_legal_guardian" className="text-sm font-normal text-foreground">
                Responsável legal
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_financial_responsible"
                checked={state.is_financial_responsible}
                onCheckedChange={(checked) => set("is_financial_responsible", checked === true)}
              />
              <Label
                htmlFor="is_financial_responsible"
                className="text-sm font-normal text-foreground"
              >
                Responsável financeiro
              </Label>
            </div>
          </div>

          <FormField id="notes" label="Observações" error={errors['notes']}>
            <Textarea
              id="notes"
              value={state.notes}
              onChange={(event) => set("notes", event.target.value)}
              maxLength={500}
              rows={3}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={save.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar vínculo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}