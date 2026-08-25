import { PersonName } from "@/features/persons/components/PersonName";
import {
  ACCESSIBILITY_SUPPORT_OPTIONS,
  CHANNEL_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
  conditionsSummary,
  CONSENT_ROLE_OPTIONS,
  CONSENT_TERM_VERSION,
  EDUCATION_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  IDENTIFICATION_STATUS_OPTIONS,
  PRIORITY_NEED_OPTIONS,
  REPORT_STATUS_OPTIONS,
  RESPONDENT_ROLE_OPTIONS,
  SERVICE_NETWORK_OPTIONS,
  labelFor,
  labelsFor,
} from "../../types";
import type { IntakeDraft } from "./state";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export function StepReview({ draft }: { draft: IntakeDraft }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Revise as informações antes de enviar. Após o envio mostramos o número de protocolo.
      </p>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row
          label="Pessoa acolhida"
          value={draft.personLabel ?? <PersonName personId={draft.personId} />}
        />
        <Row
          label="Quem responde"
          value={
            draft.respondentRole ? labelFor(RESPONDENT_ROLE_OPTIONS, draft.respondentRole) : ""
          }
        />
        <Row label="Vínculo declarado" value={draft.respondentRelationship} />
        <Row label="Canal" value={labelFor(CHANNEL_OPTIONS, draft.channel)} />
      </section>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row
          label="Identificação"
          value={labelFor(IDENTIFICATION_STATUS_OPTIONS, draft.identificationStatus)}
        />
        <Row label="Laudo" value={labelFor(REPORT_STATUS_OPTIONS, draft.reportStatus)} />
        <Row
          label="Condições"
          value={conditionsSummary(draft.conditions, draft.otherCondition)}
        />
        <Row
          label="Educação"
          value={labelsFor(EDUCATION_STATUS_OPTIONS, draft.educationStatuses)}
        />
        <Row
          label="Trabalho"
          value={
            draft.employmentStatus
              ? labelFor(EMPLOYMENT_STATUS_OPTIONS, draft.employmentStatus)
              : ""
          }
        />
      </section>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row label="Redes" value={labelsFor(SERVICE_NETWORK_OPTIONS, draft.serviceNetworks)} />
        <Row label="Aguardando" value={draft.waitingForService ? draft.waitingDetails : "Não"} />
        <Row
          label="Necessidades prioritárias"
          value={labelsFor(PRIORITY_NEED_OPTIONS, draft.priorityNeeds)}
        />
        <Row label="Principal barreira" value={draft.primaryNeedBarrier} />
        <Row
          label="Acessibilidade"
          value={labelsFor(ACCESSIBILITY_SUPPORT_OPTIONS, draft.accessibilitySupports)}
        />
      </section>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row
          label="Consentimento assinado por"
          value={
            draft.consentedByPersonLabel ?? <PersonName personId={draft.consentedByPersonId} />
          }
        />
        <Row
          label="Papel"
          value={draft.consentRole ? labelFor(CONSENT_ROLE_OPTIONS, draft.consentRole) : ""}
        />
        <Row label="Versão do termo" value={CONSENT_TERM_VERSION} />
        <Row
          label="Canais autorizados"
          value={labelsFor(COMMUNICATION_CHANNEL_OPTIONS, draft.communicationChannels)}
        />
        <Row label="Assentimento" value={draft.assentRecorded ? "Registrado" : "Não registrado"} />
      </section>
    </div>
  );
}
