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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/persons/components/FormField";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { toDateInput } from "@/lib/format";
import { useUpdatePrivacyRequest } from "../queries";
import {
  PRIVACY_REQUEST_STATUS_OPTIONS,
  PRIVACY_REQUEST_TYPE_LABEL,
  type PrivacyRequest,
  type PrivacyRequestStatus,
} from "../types";

export function PrivacyRequestUpdateDialog({
  request,
  open,
  onOpenChange,
}: {
  request: PrivacyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdatePrivacyRequest();
  const [status, setStatus] = useState<PrivacyRequestStatus>("RECEIVED");
  const [reason, setReason] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !request) return;
    setStatus((request.status as PrivacyRequestStatus) ?? "RECEIVED");
    setReason(request.decision_reason ?? "");
    setDueAt(toDateInput(request.due_at ?? null));
    setErrors({});
  }, [open, request]);

  const closing = status === "COMPLETED" || status === "DENIED";

  async function handleSubmit() {
    if (!request) return;
    if (closing && !reason.trim()) {
      setErrors({ decision_reason: "Registre a decisão comunicada ao titular." });
      return;
    }

    try {
      await update.mutateAsync({
        id: request.id,
        input: {
          status,
          due_at: dueAt || null,
          decision_reason: reason.trim() || null,
        },
      });
      toast.success("Solicitação atualizada.");
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
          <DialogTitle>Atualizar solicitação</DialogTitle>
          <DialogDescription>
            {request
              ? (PRIVACY_REQUEST_TYPE_LABEL[String(request.request_type)] ?? request.request_type)
              : "Solicitação LGPD"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField id="privacy-status" label="Situação" error={errors["status"]}>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as PrivacyRequestStatus)}
            >
              <SelectTrigger id="privacy-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_REQUEST_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="privacy-due"
            label="Prazo de resposta"
            error={errors["due_at"]}
            hint="Opcional."
          >
            <Input
              id="privacy-due"
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </FormField>

          <FormField
            id="privacy-reason"
            label="Decisão institucional"
            error={errors["decision_reason"]}
            hint="Comunicação registrada ao titular."
          >
            <Textarea
              id="privacy-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
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
