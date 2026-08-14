import {
  CONDITION_OPTIONS,
  CONSENT_DEFINITIONS,
  DIAGNOSIS_STATUS_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  PRIORITY_NEED_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
  SUPPORT_NETWORK_OPTIONS,
  WORK_STATUS_OPTIONS,
  labelFor,
} from "../../types";
import type { IntakeDraft } from "./state";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export function StepReview({ draft }: { draft: IntakeDraft }) {
  const grantedConsents = CONSENT_DEFINITIONS.filter(
    (consent) => draft.consents[consent.type],
  ).map((consent) => consent.label);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Revise as informações antes de enviar. Após o envio mostramos o número de protocolo.
      </p>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row label="Nome" value={draft.fullName} />
        <Row label="Como prefere ser chamada" value={draft.preferredName} />
        <Row label="Cidade / UF" value={[draft.city, draft.stateCode].filter(Boolean).join(" / ")} />
        <Row label="Bairro" value={draft.neighborhood} />
      </section>

      <section className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Row
          label="Condições declaradas"
          value={draft.conditions.map((item) => labelFor(CONDITION_OPTIONS, item)).join(", ")}
        />
        <Row
          label="Diagnóstico"
          value={labelFor(DIAGNOSIS_STATUS_OPTIONS, draft.diagnosisStatus)}
        />
        <Row
          label="Nível de apoio"
          value={draft.supportLevel ? labelFor(SUPPORT_LEVEL_OPTIONS, draft.supportLevel) : ""}
        />
        <Row
          label="Educação"
          value={labelFor(EDUCATION_STATUS_OPTIONS, draft.educationStatus)}
        />
        <Row label="Trabalho" value={labelFor(WORK_STATUS_OPTIONS, draft.workStatus)} />
        <Row
          label="Rede de apoio"
          value={draft.supportNetwork
            .map((item) => labelFor(SUPPORT_NETWORK_OPTIONS, item))
            .join(", ")}
        />
      </section>

      <section className="surface-card space-y-3 rounded-2xl p-5">
        <Row
          label="Necessidades prioritárias"
          value={draft.priorityNeeds
            .map((item) => labelFor(PRIORITY_NEED_OPTIONS, item))
            .join(", ")}
        />
        <Row
          label="Responsáveis informados"
          value={draft.guardians
            .map((guardian) => `${guardian.fullName} (${guardian.relationship})`)
            .join(", ")}
        />
        <Row label="Consentimentos autorizados" value={grantedConsents.join(", ")} />
      </section>
    </div>
  );
}