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
import { toDateInput } from "@/lib/format";
import { useUpdateCareRequest } from "../queries";
import {
  CARE_REQUEST_PRIORITY_OPTIONS,
  CARE_REQUEST_STATUS_OPTIONS,
  type CareRequest,
  type CareRequestPriority,
  type CareRequestStatus,
} from "../types";

export function CareRequestUpdateDialog({
  request,
  open,
  onOpenChange,
}: {
  request: CareRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateCareRequest();
  const [status, setStatus] = useState<CareRequestStatus>("IDENTIFIED");
  const [priority, setPriority] = useState<CareRequestPriority>("NORMAL");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [waitingSince, setWaitingSince] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [assignedName, setAssignedName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !request) return;
    setStatus((request.status as CareRequestStatus) ?? "IDENTIFIED");
    setPriority((request.priority as CareRequestPriority) ?? "NORMAL");
    setCategory(request.category ?? "");
    setDescription(request.description ?? "");
    setDestination(request.referral_destination ?? "");
    setWaitingSince(toDateInput(request.waiting_since ?? null));
    setAssignedId(request.assigned_person_id ?? "");
    setAssignedName(null);
    setErrors({});
  }, [open, request]);

  const isReferral = status === "REFERRED";

  async function handleSubmit() {
    if (!request) return;
    const nextErrors: Record<string, string> = {};
    if (!category.trim()) nextErrors["category"] = "Informe a categoria da demanda.";
    if (!description.trim()) nextErrors["description"] = "Descreva a demanda.";
    if (isReferral && !destination.trim())
      nextErrors["referral_destination"] = "Informe o destino do encaminhamento.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await update.mutateAsync({
        id: request.id,
        input: {
          status,
          priority,
          category: category.trim(),
          description: description.trim(),
          referral_destination: destination.trim() || null,
          waiting_since: waitingSince || null,
          assigned_person_id: assignedId || null,
        },
      });
      toast.success("Demanda atualizada.");
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
          <DialogTitle>Atualizar demanda</DialogTitle>
          <DialogDescription>
            Acompanhe a situação, prioridade e encaminhamento desta demanda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="update-status" label="Situação" error={errors["status"]}>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as CareRequestStatus)}
              >
                <SelectTrigger id="update-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARE_REQUEST_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="update-priority" label="Prioridade" error={errors["priority"]}>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as CareRequestPriority)}
              >
                <SelectTrigger id="update-priority">
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
          </div>

          <FormField id="update-category" label="Categoria" error={errors["category"]}>
            <Input
              id="update-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </FormField>

          <FormField id="update-description" label="Descrição" error={errors["description"]}>
            <Textarea
              id="update-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </FormField>

          <FormField
            id="update-waiting"
            label="Em espera desde"
            error={errors["waiting_since"]}
            hint="Opcional."
          >
            <Input
              id="update-waiting"
              type="date"
              value={waitingSince}
              onChange={(event) => setWaitingSince(event.target.value)}
            />
          </FormField>

          <FormField
            id="update-destination"
            label="Destino do encaminhamento"
            error={errors["referral_destination"]}
            hint={isReferral ? undefined : "Opcional."}
          >
            <Input
              id="update-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Ex.: rede pública de saúde, unidade parceira"
            />
          </FormField>

          <FormField
            id="update-assigned"
            label="Pessoa responsável"
            error={errors["assigned_person_id"]}
            hint="Opcional."
          >
            <PersonPicker
              value={assignedId}
              selectedLabel={assignedName}
              onChange={(id, person) => {
                setAssignedId(id);
                setAssignedName(person.full_name ?? null);
              }}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={update.isPending} onClick={() => void handleSubmit()}>
            {update.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
