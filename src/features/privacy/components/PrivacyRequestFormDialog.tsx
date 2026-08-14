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
  const { can } = useSession();
  const create = useCreatePrivacyRequest();

  const [requestType, setRequestType] = useState<PrivacyRequestType>("ACCESS");
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) return;
    setRequestType("ACCESS");
    setPersonId("");
    setPersonName(null);
    setName("");
    setEmail("");
    setDescription("");
    setErrors({});
  }, [open]);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors["requester_name"] = "Informe o nome do titular ou solicitante.";
    if (!email.trim()) nextErrors["requester_email"] = "Informe um e-mail para retorno.";
    if (!description.trim()) nextErrors["description"] = "Descreva o pedido recebido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await create.mutateAsync({
        request_type: requestType,
        person_id: personId || null,
        requester_name: name.trim(),
        requester_email: email.trim(),
        description: description.trim(),
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

          {can("person.read") ? (
            <FormField
              id="privacy-person"
              label="Pessoa relacionada"
              hint="Opcional, quando o titular já está cadastrado."
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
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="privacy-name" label="Solicitante" error={errors["requester_name"]}>
              <Input
                id="privacy-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </FormField>
            <FormField id="privacy-email" label="E-mail" error={errors["requester_email"]}>
              <Input
                id="privacy-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
          </div>

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
