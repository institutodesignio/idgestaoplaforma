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
import { ApiError, apiErrorMessage } from "@/lib/api";
import { useSaveAddress } from "../queries";
import { ADDRESS_TYPE_OPTIONS, type AddressInput, type PersonAddress } from "../types";
import { FormField } from "./FormField";

type FormState = {
  address_type: string;
  postal_code: string;
  street: string;
  street_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state_code: string;
  country_code: string;
  is_primary: boolean;
};

const EMPTY: FormState = {
  address_type: "HOME",
  postal_code: "",
  street: "",
  street_number: "",
  address_complement: "",
  neighborhood: "",
  city: "",
  state_code: "",
  country_code: "BR",
  is_primary: false,
};

export function AddressFormDialog({
  open,
  onOpenChange,
  personId,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  address?: PersonAddress | null;
}) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveAddress(personId);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState(
      address
        ? {
            address_type: address.address_type ?? "HOME",
            postal_code: address.postal_code ?? "",
            street: address.street ?? "",
            street_number: address.street_number ?? "",
            address_complement: address.address_complement ?? "",
            neighborhood: address.neighborhood ?? "",
            city: address.city ?? "",
            state_code: address.state_code ?? "",
            country_code: address.country_code ?? "BR",
            is_primary: Boolean(address.is_primary),
          }
        : EMPTY,
    );
  }, [open, address]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;

    const nextErrors: Record<string, string> = {};
    const postal = state.postal_code.replace(/\D/g, "");
    if (state.postal_code && postal.length !== 8) {
      nextErrors['postal_code'] = "O CEP deve ter 8 dígitos.";
    }
    if (state.state_code && !/^[A-Za-z]{2}$/.test(state.state_code.trim())) {
      nextErrors['state_code'] = "Use a sigla com 2 letras (ex.: SP).";
    }
    if (state.country_code && !/^[A-Za-z]{2}$/.test(state.country_code.trim())) {
      nextErrors['country_code'] = "Use o código com 2 letras (ex.: BR).";
    }
    if (!state.street.trim()) nextErrors['street'] = "Informe o logradouro.";
    if (!state.city.trim()) nextErrors['city'] = "Informe a cidade.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const nullable = (value: string) => (value.trim() === "" ? null : value.trim());
    const input: AddressInput = {
      address_type: state.address_type,
      postal_code: postal ? postal : null,
      street: nullable(state.street),
      street_number: nullable(state.street_number),
      address_complement: nullable(state.address_complement),
      neighborhood: nullable(state.neighborhood),
      city: nullable(state.city),
      state_code: state.state_code ? state.state_code.trim().toUpperCase() : null,
      country_code: state.country_code ? state.country_code.trim().toUpperCase() : null,
      is_primary: state.is_primary,
    };

    try {
      await save.mutateAsync(address ? { addressId: address.id, input } : { input });
      toast.success(address ? "Endereço atualizado." : "Endereço adicionado.");
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
          <DialogTitle>{address ? "Editar endereço" : "Adicionar endereço"}</DialogTitle>
          <DialogDescription>Endereço vinculado a esta pessoa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="address_type" label="Tipo de endereço" error={errors['address_type']}>
              <Select
                value={state.address_type}
                onValueChange={(value) => set("address_type", value)}
              >
                <SelectTrigger id="address_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="postal_code" label="CEP" error={errors['postal_code']} hint="8 dígitos.">
              <Input
                id="postal_code"
                value={state.postal_code}
                onChange={(event) => set("postal_code", event.target.value)}
                inputMode="numeric"
                maxLength={9}
              />
            </FormField>

            <FormField id="street" label="Logradouro" error={errors['street']}>
              <Input
                id="street"
                value={state.street}
                onChange={(event) => set("street", event.target.value)}
                maxLength={160}
              />
            </FormField>

            <FormField id="street_number" label="Número" error={errors['street_number']}>
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
              error={errors['address_complement']}
            >
              <Input
                id="address_complement"
                value={state.address_complement}
                onChange={(event) => set("address_complement", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="neighborhood" label="Bairro" error={errors['neighborhood']}>
              <Input
                id="neighborhood"
                value={state.neighborhood}
                onChange={(event) => set("neighborhood", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="city" label="Cidade" error={errors['city']}>
              <Input
                id="city"
                value={state.city}
                onChange={(event) => set("city", event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField id="state_code" label="UF" error={errors['state_code']} hint="2 letras.">
              <Input
                id="state_code"
                value={state.state_code}
                onChange={(event) => set("state_code", event.target.value.toUpperCase())}
                maxLength={2}
              />
            </FormField>

            <FormField id="country_code" label="País" error={errors['country_code']} hint="2 letras.">
              <Input
                id="country_code"
                value={state.country_code}
                onChange={(event) => set("country_code", event.target.value.toUpperCase())}
                maxLength={2}
              />
            </FormField>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_primary"
              checked={state.is_primary}
              onCheckedChange={(checked) => set("is_primary", checked === true)}
            />
            <Label htmlFor="is_primary" className="text-sm font-normal text-foreground">
              Definir como endereço principal
            </Label>
          </div>

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
              {save.isPending ? "Salvando…" : "Salvar endereço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}