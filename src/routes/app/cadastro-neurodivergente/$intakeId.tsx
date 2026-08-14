import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldOff } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { useSession } from "@/contexts/SessionContext";
import { useIntake, useRevokeConsent } from "@/features/neurodivergent/queries";
import {
  CONDITION_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  INTAKE_STATUS_LABEL,
  PRIORITY_NEED_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
  SUPPORT_NETWORK_OPTIONS,
  WORK_STATUS_OPTIONS,
  intakeName,
  intakeProtocol,
  labelFor,
} from "@/features/neurodivergent/types";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/app/cadastro-neurodivergente/$intakeId")({
  component: IntakeDetailPage,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function IntakeDetailPage() {
  const { intakeId } = Route.useParams();
  const { can } = useSession();
  const canManageConsent = can("consent.manage");
  const query = useIntake(intakeId);
  const revoke = useRevokeConsent(intakeId);
  const [consentToRevoke, setConsentToRevoke] = useState<string | null>(null);

  const intake = query.data ?? null;

  if (query.isLoading) return <ListSkeleton rows={4} />;

  if (query.isError || !intake) {
    return (
      <ErrorState
        title="Não foi possível carregar o cadastro"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  async function handleRevoke() {
    if (!consentToRevoke) return;
    try {
      await revoke.mutateAsync({ consentId: consentToRevoke });
      toast.success("Consentimento revogado.");
      setConsentToRevoke(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8">
      <Link
        to="/app/cadastro-neurodivergente"
        search={{ page: 1, status: "", search: "" }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Cadastros
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {intakeName(intake)}
          </h1>
          <Badge variant="outline">
            {INTAKE_STATUS_LABEL[String(intake.status)] ?? intake.status}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Protocolo {intakeProtocol(intake)} • recebido em{" "}
          {formatDate(intake.submitted_at ?? intake.created_at)}
        </p>
      </header>

      <section
        aria-label="Dados do cadastro"
        className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2 xl:grid-cols-3"
      >
        <Field
          label="Território"
          value={[intake.neighborhood, intake.city, intake.state_code].filter(Boolean).join(", ")}
        />
        <Field
          label="Condições declaradas"
          value={(intake.conditions ?? [])
            .map((item) => labelFor(CONDITION_OPTIONS, item))
            .join(", ")}
        />
        <Field
          label="Nível de apoio"
          value={intake.support_level ? labelFor(SUPPORT_LEVEL_OPTIONS, intake.support_level) : ""}
        />
        <Field
          label="Educação"
          value={
            intake.education_status
              ? labelFor(EDUCATION_STATUS_OPTIONS, intake.education_status)
              : ""
          }
        />
        <Field
          label="Trabalho"
          value={intake.work_status ? labelFor(WORK_STATUS_OPTIONS, intake.work_status) : ""}
        />
        <Field
          label="Rede de apoio"
          value={(intake.support_network ?? [])
            .map((item) => labelFor(SUPPORT_NETWORK_OPTIONS, item))
            .join(", ")}
        />
      </section>

      <section aria-label="Necessidades prioritárias" className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Necessidades prioritárias
        </h2>
        {(intake.priority_needs ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma necessidade declarada.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {(intake.priority_needs ?? []).map((need) => (
              <li
                key={need}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {labelFor(PRIORITY_NEED_OPTIONS, need)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(intake.guardians ?? []).length > 0 ? (
        <section aria-label="Responsáveis" className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Responsáveis</h2>
          <ul className="mt-4 space-y-3">
            {(intake.guardians ?? []).map((guardian, index) => (
              <li key={guardian.id ?? index} className="text-sm text-foreground">
                <span className="font-medium">{guardian.full_name ?? "Responsável"}</span>
                {guardian.relationship ? ` • ${guardian.relationship}` : ""}
                {guardian.phone ? ` • ${guardian.phone}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Consentimentos" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Consentimentos</h2>
        {(intake.consents ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum consentimento registrado.</p>
        ) : (
          <ul className="space-y-3">
            {(intake.consents ?? []).map((consent) => {
              const active = consent.granted && !consent.revoked_at;
              return (
                <li
                  key={consent.id}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">
                      {consent.purpose ?? consent.consent_type ?? "Consentimento"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Concedido em {formatDate(consent.granted_at)}
                      {consent.revoked_at ? ` • revogado em ${formatDate(consent.revoked_at)}` : ""}
                    </p>
                  </div>
                  <Badge variant={active ? "secondary" : "outline"}>
                    {active ? "Ativo" : "Revogado"}
                  </Badge>
                  {active && canManageConsent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConsentToRevoke(consent.id)}
                    >
                      <ShieldOff aria-hidden="true" className="size-4" />
                      Revogar
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AlertDialog
        open={Boolean(consentToRevoke)}
        onOpenChange={(open) => !open && setConsentToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar este consentimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O tratamento vinculado a este consentimento será interrompido conforme a política
              institucional de privacidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleRevoke();
              }}
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
