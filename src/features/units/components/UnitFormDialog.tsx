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
import { unwrapUnit } from "../api";
import { useSaveUnit } from "../queries";
import { UNIT_STATUS_LABEL, type Unit, type UnitInput, type UnitStatus } from "../types";

type FormState = {
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  postal_code: string;
  street: string;
  street_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state_code: string;
  is_headquarters: boolean;
  status: UnitStatus;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  email: "",
  phone: "",
  postal_code: "",
  street: "",
  street_number: "",
  address_complement: "",
  neighborhood: "",
  city: "",
  state_code: "",
  is_headquarters: false,
  status: "ACTIVE",
};

export function UnitFormDialog({
  open,
  onOpenChange,
  unit,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSaved?: (unitId?: string) => void;
}) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveUnit(unit?.id);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState(
      unit
        ? {
            name: unit.name ?? "",
            slug: unit.slug ?? "",
            description: unit.description ?? "",
            email: unit.email ?? "",
            phone: unit.phone ?? "",
            postal_code: unit.postal_code ?? "",
            street: unit.street ?? "",
            street_number: unit.street_number ?? "",
            address_complement: unit.address_complement ?? "",
            neighborhood: unit.neighborhood ?? "",
            city: unit.city ?? "",
            state_code: unit.state_code ?? "",
            is_headquarters: Boolean(unit.is_headquarters),
            status: (unit.status as UnitStatus) ?? "ACTIVE",
          }
        : EMPTY,
    );
  }, [open, unit]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;

    const nextErrors: Record<string, string> = {};
    if (!state.name.trim()) nextErrors["name"] = "Informe o nome da unidade.";
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      nextErrors["email"] = "Informe um e-mail válido.";
    }
    if (state.state_code && !/^[A-Za-z]{2}$/.test(state.state_code.trim())) {
      nextErrors["state_code"] = "Use a sigla com 2 letras (ex.: SP).";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const nullable = (value: string) => (value.trim() === "" ? null : value.trim());
    const input: UnitInput = {
      name: state.name.trim(),
      slug: nullable(state.slug),
      description: nullable(state.description),
      email: nullable(state.email),
      phone: nullable(state.phone),
      postal_code: state.postal_code ? state.postal_code.replace(/\D/g, "") || null : null,
      street: nullable(state.street),
      street_number: nullable(state.street_number),
      address_complement: nullable(state.address_complement),
      neighborhood: nullable(state.neighborhood),
      city: nullable(state.city),
      state_code: state.state_code ? state.state_code.trim().toUpperCase() : null,
      is_headquarters: state.is_headquarters,
      status: state.status,
    };

    try {
      const result = await save.mutateAsync(input);
      toast.success(unit ? "Unidade atualizada." : "Unidade criada.");
      onOpenChange(false);
      onSaved?.(unwrapUnit(result)?.id);
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
          <DialogTitle>{unit ? "Editar unidade" : "Nova unidade"}</DialogTitle>
          <DialogDescription>
            Unidades e espaços de atendimento do Instituto Designio.
          </DialogDescription>
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

            <FormField id="slug" label="Identificador (slug)" error={errors["slug"]}>
              <Input
                id="slug"
                value={state.slug}
                onChange={(event) => set("slug", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="email" label="E-mail" error={errors["email"]}>
              <Input
                id="email"
                type="email"
                value={state.email}
                onChange={(event) => set("email", event.target.value)}
              />
            </FormField>

            <FormField id="phone" label="Telefone" error={errors["phone"]}>
              <Input
                id="phone"
                value={state.phone}
                onChange={(event) => set("phone", event.target.value)}
                maxLength={20}
              />
            </FormField>

            <FormField id="postal_code" label="CEP" error={errors["postal_code"]}>
              <Input
                id="postal_code"
                value={state.postal_code}
                onChange={(event) => set("postal_code", event.target.value)}
                inputMode="numeric"
                maxLength={9}
              />
            </FormField>

            <FormField id="street" label="Logradouro" error={errors["street"]}>
              <Input
                id="street"
                value={state.street}
                onChange={(event) => set("street", event.target.value)}
                maxLength={160}
              />
            </FormField>

            <FormField id="street_number" label="Número" error={errors["street_number"]}>
              <Input
                id="street_number"
                value={state.street_number}
                onChange={(event) => set("street_number", event.target.value)}
                maxLength={20}
              />
            </FormField>

            <FormField
              id="address_complement"
              label="Complemento"
              error={errors["address_complement"]}
            >
              <Input
                id="address_complement"
                value={state.address_complement}
                onChange={(event) => set("address_complement", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="neighborhood" label="Bairro" error={errors["neighborhood"]}>
              <Input
                id="neighborhood"
                value={state.neighborhood}
                onChange={(event) => set("neighborhood", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="city" label="Cidade" error={errors["city"]}>
              <Input
                id="city"
                value={state.city}
                onChange={(event) => set("city", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="state_code" label="UF" error={errors["state_code"]}>
              <Input
                id="state_code"
                value={state.state_code}
                onChange={(event) => set("state_code", event.target.value.toUpperCase())}
                maxLength={2}
              />
            </FormField>

            <FormField id="status" label="Situação" error={errors["status"]}>
              <Select
                value={state.status}
                onValueChange={(value) => set("status", value as UnitStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField id="description" label="Descrição" error={errors["description"]}>
            <Textarea
              id="description"
              value={state.description}
              onChange={(event) => set("description", event.target.value)}
              rows={3}
              maxLength={600}
            />
          </FormField>

          <div className="flex items-start gap-2">
            <Checkbox
              id="is_headquarters"
              checked={state.is_headquarters}
              onCheckedChange={(checked) => set("is_headquarters", checked === true)}
            />
            <Label htmlFor="is_headquarters" className="text-sm font-normal text-muted-foreground">
              Esta é a sede principal da organização (apenas uma unidade pode ser a sede).
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
