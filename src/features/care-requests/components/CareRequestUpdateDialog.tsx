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
import { ApiError, apiErrorMessage } from "@/lib/api";
import { todayInput } from "@/lib/format";
import { useUpdateCareRequest } from "../queries";
import {
  CARE_REQUEST_PRIORITY_OPTIONS,
  CARE_REQUEST_STATUS_OPTIONS,
  careRequestPersonName,
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
  const [status, setStatus] = useState<CareRequestStatus>("RECEIVED");
  const [priority, setPriority] = useState<CareRequestPriority>("MEDIUM");
  const [destination, setDestination] = useState("");
  const [referralNotes, setReferralNotes] = useState("");
  const [conclusionNotes, setConclusionNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !request) return;
    setStatus((request.status as CareRequestStatus) ?? "RECEIVED");
    setPriority((request.priority as CareRequestPriority) ?? "MEDIUM");
    setDestination(request.referral_destination ?? "");
    setReferralNotes(request.referral_notes ?? "");
    setConclusionNotes(request.conclusion_notes ?? "");
    setErrors({});
  }, [open, request]);

  const isReferral = status === "REFERRED";
  const isConclusion = status === "CONCLUDED" || status === "CANCELLED";

  async function handleSubmit() {
    if (!request) return;
    const nextErrors: Record<string, string> = {};
    if (isReferral && !destination.trim())
      nextErrors["referral_destination"] = "Informe o destino do encaminhamento.";
    if (isConclusion && !conclusionNotes.trim())
      nextErrors["conclusion_notes"] = "Registre o desfecho desta demanda.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await update.mutateAsync({
        id: request.id,
        input: {
          status,
          priority,
          referral_destination: isReferral ? destination.trim() : null,
          referral_notes: isReferral ? referralNotes.trim() || null : null,
          conclusion_notes: isConclusion ? conclusionNotes.trim() : null,
          concluded_at: isConclusion ? todayInput() : null,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atualizar demanda</DialogTitle>
          <DialogDescription>
            {request ? careRequestPersonName(request) : "Demanda institucional"} —{" "}
            {request?.requested_service ?? "serviço não informado"}
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

          {isReferral ? (
            <>
              <FormField
                id="update-destination"
                label="Destino do encaminhamento"
                error={errors["referral_destination"]}
              >
                <Input
                  id="update-destination"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Ex.: rede pública de saúde, unidade parceira"
                />
              </FormField>
              <FormField
                id="update-referral-notes"
                label="Observações do encaminhamento"
                error={errors["referral_notes"]}
              >
                <Textarea
                  id="update-referral-notes"
                  value={referralNotes}
                  onChange={(event) => setReferralNotes(event.target.value)}
                  rows={3}
                />
              </FormField>
            </>
          ) : null}

          {isConclusion ? (
            <FormField id="update-conclusion" label="Desfecho" error={errors["conclusion_notes"]}>
              <Textarea
                id="update-conclusion"
                value={conclusionNotes}
                onChange={(event) => setConclusionNotes(event.target.value)}
                rows={3}
              />
            </FormField>
          ) : null}
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
