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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { useSession } from "@/contexts/SessionContext";
import { PersonName } from "@/features/persons/components/PersonName";
import { useIntake, useRevokeConsent } from "@/features/neurodivergent/queries";
import {
  ACCESSIBILITY_SUPPORT_OPTIONS,
  CHANNEL_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
  CONDITION_OPTIONS,
  CONSENT_ROLE_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  IDENTIFICATION_STATUS_OPTIONS,
  INTAKE_STATUS_LABEL,
  PRIORITY_NEED_OPTIONS,
  REPORT_STATUS_OPTIONS,
  RESPONDENT_ROLE_OPTIONS,
  SERVICE_NETWORK_OPTIONS,
  intakeProtocol,
  labelFor,
  labelsFor,
} from "@/features/neurodivergent/types";
import { apiErrorMessage } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";

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
  const [reason, setReason] = useState("");

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

  const profile = intake.neurodivergent_profiles?.[0] ?? null;
  const consents = intake.data_consents ?? [];

  async function handleRevoke() {
    if (!consentToRevoke) return;
    if (!reason.trim()) {
      toast.error("Informe o motivo da revogação.");
      return;
    }
    try {
      await revoke.mutateAsync({ consentId: consentToRevoke, reason: reason.trim() });
      toast.success("Consentimento revogado.");
      setConsentToRevoke(null);
      setReason("");
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
            <PersonName personId={intake.person_id} />
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
        aria-label="Quem respondeu"
        className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2 xl:grid-cols-3"
      >
        <Field
          label="Quem respondeu"
          value={
            intake.respondent_role
              ? labelFor(RESPONDENT_ROLE_OPTIONS, String(intake.respondent_role))
              : ""
          }
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pessoa respondente
          </p>
          <p className="mt-1 text-sm text-foreground">
            {intake.respondent_person_id ? (
              <PersonName personId={intake.respondent_person_id} />
            ) : (
              "A própria pessoa"
            )}
          </p>
        </div>
        <Field label="Vínculo declarado" value={intake.respondent_relationship ?? ""} />
        <Field
          label="Canal"
          value={intake.channel ? labelFor(CHANNEL_OPTIONS, String(intake.channel)) : ""}
        />
      </section>

      {profile ? (
        <>
          <section
            aria-label="Perfil declarado"
            className="surface-card grid gap-5 rounded-2xl p-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <Field
              label="Identificação"
              value={
                profile.identification_status
                  ? labelFor(IDENTIFICATION_STATUS_OPTIONS, profile.identification_status)
                  : ""
              }
            />
            <Field
              label="Laudo ou relatório"
              value={
                profile.report_status ? labelFor(REPORT_STATUS_OPTIONS, profile.report_status) : ""
              }
            />
            <Field
              label="Condições declaradas"
              value={labelsFor(CONDITION_OPTIONS, profile.conditions ?? [])}
            />
            <Field label="Outra condição" value={profile.other_condition ?? ""} />
            <Field
              label="Educação"
              value={labelsFor(EDUCATION_STATUS_OPTIONS, profile.education_statuses ?? [])}
            />
            <Field label="Instituição de ensino" value={profile.education_institution ?? ""} />
            <Field label="Apoio escolar necessário" value={profile.school_support_needed ?? ""} />
            <Field
              label="Trabalho"
              value={
                profile.employment_status
                  ? labelFor(EMPLOYMENT_STATUS_OPTIONS, profile.employment_status)
                  : ""
              }
            />
            <Field
              label="Redes de serviço"
              value={labelsFor(SERVICE_NETWORK_OPTIONS, profile.service_networks ?? [])}
            />
            <Field label="Serviços em andamento" value={profile.current_services ?? ""} />
            <Field
              label="Aguardando serviço"
              value={
                profile.waiting_for_service ? profile.waiting_details || "Sim" : "Não"
              }
            />
            <Field
              label="Apoios de acessibilidade"
              value={labelsFor(
                ACCESSIBILITY_SUPPORT_OPTIONS,
                profile.accessibility_supports ?? [],
              )}
            />
            <Field label="Outro apoio" value={profile.accessibility_other ?? ""} />
          </section>

          <section aria-label="Necessidades prioritárias" className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Necessidades prioritárias
            </h2>
            {(profile.priority_needs ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma necessidade declarada.</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {(profile.priority_needs ?? []).map((need) => (
                  <li
                    key={need}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {labelFor(PRIORITY_NEED_OPTIONS, need)}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5">
              <Field label="Principal barreira" value={profile.primary_need_barrier ?? ""} />
            </div>
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Este cadastro ainda não possui perfil declarado.
        </p>
      )}

      <section aria-label="Consentimentos" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Consentimentos</h2>
        {consents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum consentimento registrado.</p>
        ) : (
          <ul className="space-y-3">
            {consents.map((consent) => {
              const active = !consent.revoked_at;
              return (
                <li
                  key={consent.id}
                  className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <div className="min-w-48 flex-1">
                    <p className="font-medium text-foreground">
                      {consent.consent_role
                        ? labelFor(CONSENT_ROLE_OPTIONS, String(consent.consent_role))
                        : "Consentimento"}{" "}
                      • termo {consent.term_version ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assinado por <PersonName personId={consent.consented_by_person_id} /> em{" "}
                      {formatDateTime(consent.signed_at)}
                      {consent.revoked_at
                        ? ` • revogado em ${formatDateTime(consent.revoked_at)}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Canais:{" "}
                      {labelsFor(
                        COMMUNICATION_CHANNEL_OPTIONS,
                        consent.communication_channels ?? [],
                      ) || "não informados"}
                      {consent.assent_recorded ? " • assentimento registrado" : ""}
                    </p>
                  </div>
                  <Badge variant={active ? "secondary" : "outline"}>
                    {active ? "Ativo" : "Revogado"}
                  </Badge>
                  {active && canManageConsent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReason("");
                        setConsentToRevoke(consent.id);
                      }}
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
          <div className="space-y-2">
            <Label htmlFor="revoke-reason">Motivo da revogação</Label>
            <Textarea
              id="revoke-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleRevoke();
              }}
              disabled={revoke.isPending}
            >
              {revoke.isPending ? "Revogando…" : "Revogar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
