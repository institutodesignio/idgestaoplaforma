import { nowIsoWithOffset } from "@/lib/format";
import {
  CONSENT_TERM_VERSION,
  MAX_PRIORITY_NEEDS,
  type CommunicationChannel,
  type ConsentRole,
  type IntakeChannel,
  type IntakeRespondentRole,
  type IntakeSubmitInput,
} from "../../types";

export type IntakeDraft = {
  personId: string;
  personLabel: string | null;
  respondentRole: IntakeRespondentRole | "";
  respondentPersonId: string;
  respondentPersonLabel: string | null;
  respondentRelationship: string;
  channel: IntakeChannel;
  identificationStatus: string;
  conditions: string[];
  otherCondition: string;
  reportStatus: string;
  educationStatuses: string[];
  educationInstitution: string;
  schoolSupportNeeded: string;
  employmentStatus: string;
  serviceNetworks: string[];
  currentServices: string;
  waitingForService: boolean;
  waitingDetails: string;
  priorityNeeds: string[];
  primaryNeedBarrier: string;
  accessibilitySupports: string[];
  accessibilityOther: string;
  consentedByPersonId: string;
  consentedByPersonLabel: string | null;
  consentRole: ConsentRole | "";
  sensitiveDataConsent: boolean;
  assentRecorded: boolean;
  communicationChannels: string[];
};

export const EMPTY_DRAFT: IntakeDraft = {
  personId: "",
  personLabel: null,
  respondentRole: "",
  respondentPersonId: "",
  respondentPersonLabel: null,
  respondentRelationship: "",
  channel: "IN_PERSON",
  identificationStatus: "",
  conditions: [],
  otherCondition: "",
  reportStatus: "",
  educationStatuses: [],
  educationInstitution: "",
  schoolSupportNeeded: "",
  employmentStatus: "",
  serviceNetworks: [],
  currentServices: "",
  waitingForService: false,
  waitingDetails: "",
  priorityNeeds: [],
  primaryNeedBarrier: "",
  accessibilitySupports: [],
  accessibilityOther: "",
  consentedByPersonId: "",
  consentedByPersonLabel: null,
  consentRole: "",
  sensitiveDataConsent: false,
  assentRecorded: false,
  communicationChannels: [],
};

export const STEP_TITLES = [
  "Pessoa e quem responde",
  "Perfil",
  "Educação e trabalho",
  "Rede e necessidades",
  "Consentimento",
  "Revisão",
];

export type StepErrors = Record<string, string>;

/** Validação por etapa espelhando os schemas estritos do backend. */
export function validateStep(step: number, draft: IntakeDraft): StepErrors {
  const errors: StepErrors = {};

  if (step === 0) {
    if (!draft.personId) errors["person_id"] = "Selecione a pessoa já cadastrada em Pessoas.";
    if (!draft.respondentRole) errors["respondent_role"] = "Informe quem está respondendo.";
    if (draft.respondentRole && draft.respondentRole !== "SELF" && !draft.respondentPersonId)
      errors["respondent_person_id"] = "Selecione a pessoa que está respondendo.";
    if (draft.respondentRole === "OTHER" && !draft.respondentRelationship.trim())
      errors["respondent_relationship"] = "Descreva o vínculo com a pessoa.";
  }

  if (step === 1) {
    if (!draft.identificationStatus)
      errors["identification_status"] = "Escolha a situação de identificação.";
    if (draft.conditions.length === 0)
      errors["conditions"] = "Selecione ao menos uma condição declarada.";
    if (draft.conditions.includes("OTHER") && !draft.otherCondition.trim())
      errors["other_condition"] = "Descreva a outra condição.";
    if (!draft.reportStatus) errors["report_status"] = "Informe a situação do laudo ou relatório.";
  }

  if (step === 2) {
    if (draft.educationStatuses.length === 0)
      errors["education_statuses"] = "Selecione ao menos uma situação educacional.";
  }

  if (step === 3) {
    if (draft.serviceNetworks.length === 0)
      errors["service_networks"] = "Selecione ao menos uma rede de serviços.";
    if (draft.priorityNeeds.length === 0)
      errors["priority_needs"] = "Escolha ao menos uma necessidade prioritária.";
    if (draft.priorityNeeds.length > MAX_PRIORITY_NEEDS)
      errors["priority_needs"] = `Escolha no máximo ${MAX_PRIORITY_NEEDS} necessidades.`;
    if (!draft.primaryNeedBarrier.trim())
      errors["primary_need_barrier"] = "Descreva a principal barreira enfrentada.";
    if (draft.accessibilitySupports.includes("OTHER") && !draft.accessibilityOther.trim())
      errors["accessibility_other"] = "Descreva o outro apoio de acessibilidade.";
    if (draft.waitingForService && !draft.waitingDetails.trim())
      errors["waiting_details"] = "Informe o que está aguardando.";
  }

  if (step === 4) {
    if (!draft.consentedByPersonId)
      errors["consented_by_person_id"] = "Selecione quem assina o consentimento.";
    if (!draft.consentRole) errors["consent_role"] = "Informe o papel de quem consente.";
    if (!draft.sensitiveDataConsent)
      errors["sensitive_data_consent"] =
        "O consentimento para dados sensíveis é necessário para concluir.";
    if (draft.communicationChannels.length === 0)
      errors["communication_channels"] = "Escolha ao menos um canal de comunicação.";
  }

  return errors;
}

export function draftToPayload(draft: IntakeDraft): IntakeSubmitInput {
  const isSelf = draft.respondentRole === "SELF";
  return {
    person_id: draft.personId,
    respondent_person_id: isSelf ? null : draft.respondentPersonId || null,
    respondent_role: draft.respondentRole as IntakeRespondentRole,
    respondent_relationship: draft.respondentRelationship.trim() || null,
    channel: draft.channel,
    profile: {
      identification_status: draft.identificationStatus,
      conditions: draft.conditions,
      other_condition: draft.conditions.includes("OTHER")
        ? draft.otherCondition.trim() || null
        : null,
      report_status: draft.reportStatus,
      education_statuses: draft.educationStatuses,
      education_institution: draft.educationInstitution.trim() || null,
      school_support_needed: draft.schoolSupportNeeded.trim() || null,
      employment_status: draft.employmentStatus || null,
      service_networks: draft.serviceNetworks,
      current_services: draft.currentServices.trim() || null,
      waiting_for_service: draft.waitingForService,
      waiting_details: draft.waitingForService ? draft.waitingDetails.trim() || null : null,
      priority_needs: draft.priorityNeeds,
      primary_need_barrier: draft.primaryNeedBarrier.trim(),
      accessibility_supports: draft.accessibilitySupports,
      accessibility_other: draft.accessibilitySupports.includes("OTHER")
        ? draft.accessibilityOther.trim() || null
        : null,
    },
    consent: {
      consented_by_person_id: draft.consentedByPersonId,
      consent_role: draft.consentRole as ConsentRole,
      term_version: CONSENT_TERM_VERSION,
      sensitive_data_consent: true,
      assent_recorded: draft.assentRecorded,
      communication_channels: draft.communicationChannels as CommunicationChannel[],
      signed_at: nowIsoWithOffset(),
    },
  };
}
