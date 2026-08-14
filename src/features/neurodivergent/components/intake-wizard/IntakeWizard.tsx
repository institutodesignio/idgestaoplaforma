import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { CONSENT_DEFINITIONS, intakeProtocol } from "../../types";
import { useSubmitIntake } from "../../queries";
import { StepEducationWork } from "./StepEducationWork";
import { StepGuardians } from "./StepGuardians";
import { StepNetworkNeeds } from "./StepNetworkNeeds";
import { StepPersonTerritory } from "./StepPersonTerritory";
import { StepPrivacy } from "./StepPrivacy";
import { StepProfile } from "./StepProfile";
import { StepReview } from "./StepReview";
import {
  EMPTY_DRAFT,
  STEP_TITLES,
  draftToPayload,
  validateStep,
  type IntakeDraft,
  type StepErrors,
} from "./state";

const REQUIRED_CONSENTS = CONSENT_DEFINITIONS.filter((consent) => consent.required).map(
  (consent) => consent.type,
);

export function IntakeWizard() {
  // Dado sensível permanece apenas em memória — nunca em localStorage.
  const [draft, setDraft] = useState<IntakeDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [protocol, setProtocol] = useState<string | null>(null);
  const submit = useSubmitIntake();

  function patch(next: Partial<IntakeDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function goNext() {
    const stepErrors = validateStep(step, draft, REQUIRED_CONSENTS);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((prev) => Math.min(STEP_TITLES.length - 1, prev + 1));
  }

  function goBack() {
    setErrors({});
    setStep((prev) => Math.max(0, prev - 1));
  }

  async function handleSubmit() {
    for (let index = 0; index < STEP_TITLES.length - 1; index += 1) {
      const stepErrors = validateStep(index, draft, REQUIRED_CONSENTS);
      if (Object.keys(stepErrors).length > 0) {
        setStep(index);
        setErrors(stepErrors);
        toast.error("Revise os campos destacados antes de enviar.");
        return;
      }
    }

    try {
      const result = await submit.mutateAsync(draftToPayload(draft));
      const code =
        result?.protocol ?? (result?.intake ? intakeProtocol(result.intake) : null) ?? "registrado";
      setProtocol(code);
      // Limpa o estado somente após o sucesso confirmado pela API.
      setDraft(EMPTY_DRAFT);
      setErrors({});
      toast.success("Cadastro enviado.");
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      toast.error(apiErrorMessage(error));
    }
  }

  if (protocol) {
    return (
      <section className="surface-card mx-auto max-w-lg rounded-2xl p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
          Cadastro recebido com cuidado
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Guarde o número de protocolo para acompanhar este cadastro junto ao Instituto Designio.
        </p>
        <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-base font-semibold text-secondary-foreground">
          {protocol}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/app/cadastro-neurodivergente" search={{ page: 1, status: "", search: "" }}>
              Ver cadastros
            </Link>
          </Button>
          <Button
            onClick={() => {
              setProtocol(null);
              setStep(0);
            }}
          >
            Novo cadastro
          </Button>
        </div>
      </section>
    );
  }

  const isLast = step === STEP_TITLES.length - 1;

  return (
    <div className="space-y-6">
      <nav aria-label="Etapas do cadastro">
        <ol className="flex flex-wrap gap-2">
          {STEP_TITLES.map((title, index) => (
            <li
              key={title}
              aria-current={index === step ? "step" : undefined}
              className={
                index === step
                  ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  : index < step
                    ? "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                    : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {index + 1}. {title}
            </li>
          ))}
        </ol>
      </nav>

      <section aria-label={STEP_TITLES[step]} className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {STEP_TITLES[step]}
        </h2>
        <div className="mt-5">
          {step === 0 ? (
            <StepPersonTerritory draft={draft} errors={errors} onChange={patch} />
          ) : step === 1 ? (
            <StepProfile draft={draft} errors={errors} onChange={patch} />
          ) : step === 2 ? (
            <StepEducationWork draft={draft} errors={errors} onChange={patch} />
          ) : step === 3 ? (
            <StepNetworkNeeds draft={draft} errors={errors} onChange={patch} />
          ) : step === 4 ? (
            <StepGuardians draft={draft} errors={errors} onChange={patch} />
          ) : step === 5 ? (
            <StepPrivacy draft={draft} errors={errors} onChange={patch} />
          ) : (
            <StepReview draft={draft} />
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" disabled={step === 0} onClick={goBack}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar
        </Button>
        {isLast ? (
          <Button disabled={submit.isPending} onClick={() => void handleSubmit()}>
            {submit.isPending ? "Enviando…" : "Enviar cadastro"}
          </Button>
        ) : (
          <Button onClick={goNext}>
            Continuar
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
