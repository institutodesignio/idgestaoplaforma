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
import { useCreatePrivacyRequest } from "../queries";
import { PRIVACY_REQUEST_TYPE_OPTIONS, type PrivacyRequestType } from "../types";

export function PrivacyRequestFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreatePrivacyRequest();

  const [requestType, setRequestType] = useState<PrivacyRequestType>("ACCESS");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [dueAt, setDueAt] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) return;
    setRequestType("ACCESS");
    setPersonId("");
    setPersonName(null);
    setDueAt("");
    setDescription("");
    setErrors({});
  }, [open]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!personId) nextErrors["person_id"] = "Selecione o titular já cadastrado em Pessoas.";
    if (!description.trim()) nextErrors["description"] = "Descreva o pedido recebido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await create.mutateAsync({
        request_type: requestType,
        person_id: personId,
        description: description.trim(),
        due_at: dueAt || null,
      });
      toast.success("Solicitação registrada.");
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
          <DialogTitle>Nova solicitação de privacidade</DialogTitle>
          <DialogDescription>
            Registre pedidos de titulares previstos na LGPD para acompanhamento de prazo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField id="privacy-type" label="Tipo de solicitação" error={errors["request_type"]}>
            <Select
              value={requestType}
              onValueChange={(value) => setRequestType(value as PrivacyRequestType)}
            >
              <SelectTrigger id="privacy-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_REQUEST_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="privacy-person"
            label="Titular dos dados"
            error={errors["person_id"]}
            hint="O titular precisa estar cadastrado no módulo Pessoas."
          >
            <PersonPicker
              value={personId}
              selectedLabel={personName}
              onChange={(id, person) => {
                setPersonId(id);
                setPersonName(person.full_name ?? null);
              }}
            />
          </FormField>

          <FormField
            id="privacy-due"
            label="Prazo de resposta"
            error={errors["due_at"]}
            hint="Opcional. O backend aplica o prazo legal padrão quando não informado."
          >
            <Input
              id="privacy-due"
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </FormField>

          <FormField id="privacy-description" label="Descrição" error={errors["description"]}>
            <Textarea
              id="privacy-description"
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
            {create.isPending ? "Registrando…" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
