import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/persons/components/FormField";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { apiErrorMessage } from "@/lib/api";
import { exportPersonData } from "../api";

/** Exportação LGPD: exige confirmação visual antes de gerar o arquivo. */
export function PersonExportSection() {
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleExport() {
    setPending(true);
    try {
      await exportPersonData(personId);
      toast.success("Exportação gerada e baixada.");
      setConfirmOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label="Exportação de dados do titular" className="surface-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Exportação de dados do titular
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Gera um arquivo JSON com os dados institucionais da pessoa selecionada, para atender pedidos
        de acesso e portabilidade.
      </p>

      <div className="mt-5 max-w-md">
        <FormField id="export-person" label="Pessoa">
          <PersonPicker
            value={personId}
            selectedLabel={personName}
            onChange={(id, person) => {
              setPersonId(id);
              setPersonName(person.full_name ?? null);
            }}
          />
        </FormField>
      </div>

      <Button className="mt-5" disabled={!personId} onClick={() => setConfirmOpen(true)}>
        <Download aria-hidden="true" className="size-4" />
        Exportar dados
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exportação de dados pessoais?</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo conterá dados pessoais de {personName ?? "a pessoa selecionada"}. Guarde e
              compartilhe apenas com o titular ou com quem tenha autorização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleExport();
              }}
            >
              {pending ? "Gerando…" : "Confirmar exportação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
