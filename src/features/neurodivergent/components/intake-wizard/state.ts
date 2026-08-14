import { MAX_PRIORITY_NEEDS, type IntakeSubmitInput } from "../../types";

export type IntakeDraft = {
  personId: string;
  personLabel: string | null;
  fullName: string;
  preferredName: string;
  birthDate: string;
  phone: string;
  email: string;
  postalCode: string;
  city: string;
  stateCode: string;
  neighborhood: string;
  conditions: string[];
  diagnosisStatus: string;
  supportLevel: string;
  communicationNotes: string;
  educationStatus: string;
  schoolName: string;
  hasSchoolSupport: boolean;
  workStatus: string;
  supportNetwork: string[];
  priorityNeeds: string[];
  additionalNotes: string;
  guardians: {
    fullName: string;
    relationship: string;
    phone: string;
    email: string;
    isLegalGuardian: boolean;
  }[];
  consents: Record<string, boolean>;
};

export const EMPTY_DRAFT: IntakeDraft = {
  personId: "",
  personLabel: null,
  fullName: "",
  preferredName: "",
  birthDate: "",
  phone: "",
  email: "",
  postalCode: "",
  city: "",
  stateCode: "",
  neighborhood: "",
  conditions: [],
  diagnosisStatus: "",
  supportLevel: "",
  communicationNotes: "",
  educationStatus: "",
  schoolName: "",
  hasSchoolSupport: false,
  workStatus: "",
  supportNetwork: [],
  priorityNeeds: [],
  additionalNotes: "",
  guardians: [],
  consents: {},
};

export const STEP_TITLES = [
  "Pessoa e território",
  "Perfil",
  "Educação e trabalho",
  "Rede e necessidades",
  "Responsáveis",
  "Privacidade",
  "Revisão",
];

export type StepErrors = Record<string, string>;

/** Validação por etapa — nenhuma etapa avança com dado essencial ausente. */
export function validateStep(
  step: number,
  draft: IntakeDraft,
  requiredConsents: string[],
): StepErrors {
  const errors: StepErrors = {};

  if (step === 0) {
    if (!draft.fullName.trim()) errors["full_name"] = "Informe o nome da pessoa.";
    if (!draft.city.trim()) errors["city"] = "Informe a cidade.";
    if (!draft.stateCode.trim()) errors["state_code"] = "Informe o estado (UF).";
  }

  if (step === 1) {
    if (draft.conditions.length === 0)
      errors["conditions"] = "Selecione ao menos uma opção, inclusive “Prefiro não informar”.";
    if (!draft.diagnosisStatus) errors["diagnosis_status"] = "Escolha a situação do diagnóstico.";
  }

  if (step === 2) {
    if (!draft.educationStatus) errors["education_status"] = "Escolha a situação educacional.";
    if (!draft.workStatus) errors["work_status"] = "Escolha a situação de trabalho.";
  }

  if (step === 3) {
    if (draft.supportNetwork.length === 0)
      errors["support_network"] = "Selecione ao menos uma opção de rede de apoio.";
    if (draft.priorityNeeds.length === 0)
      errors["priority_needs"] = "Escolha ao menos uma necessidade prioritária.";
    if (draft.priorityNeeds.length > MAX_PRIORITY_NEEDS)
      errors["priority_needs"] = `Escolha no máximo ${MAX_PRIORITY_NEEDS} necessidades.`;
  }

  if (step === 4) {
    draft.guardians.forEach((guardian, index) => {
      if (!guardian.fullName.trim()) errors[`guardian_${index}_name`] = "Informe o nome.";
      if (!guardian.relationship.trim())
        errors[`guardian_${index}_relationship`] = "Informe o vínculo com a pessoa.";
    });
  }

  if (step === 5) {
    for (const type of requiredConsents) {
      if (!draft.consents[type]) {
        errors[`consent_${type}`] = "Este consentimento é necessário para concluir o cadastro.";
      }
    }
  }

  return errors;
}

export function draftToPayload(draft: IntakeDraft): IntakeSubmitInput {
  return {
    person: {
      person_id: draft.personId || null,
      full_name: draft.fullName.trim(),
      preferred_name: draft.preferredName.trim() || null,
      birth_date: draft.birthDate || null,
      primary_phone: draft.phone.trim() || null,
      primary_email: draft.email.trim() || null,
    },
    territory: {
      postal_code: draft.postalCode.trim() || null,
      city: draft.city.trim(),
      state_code: draft.stateCode.trim().toUpperCase(),
      neighborhood: draft.neighborhood.trim() || null,
    },
    profile: {
      conditions: draft.conditions,
      diagnosis_status: draft.diagnosisStatus,
      support_level: draft.supportLevel || null,
      communication_notes: draft.communicationNotes.trim() || null,
    },
    education_work: {
      education_status: draft.educationStatus,
      school_name: draft.schoolName.trim() || null,
      has_school_support: draft.hasSchoolSupport,
      work_status: draft.workStatus,
    },
    network_needs: {
      support_network: draft.supportNetwork,
      priority_needs: draft.priorityNeeds,
      additional_notes: draft.additionalNotes.trim() || null,
    },
    guardians: draft.guardians.map((guardian) => ({
      full_name: guardian.fullName.trim(),
      relationship: guardian.relationship.trim(),
      phone: guardian.phone.trim() || null,
      email: guardian.email.trim() || null,
      is_legal_guardian: guardian.isLegalGuardian,
    })),
    consents: Object.entries(draft.consents).map(([consent_type, granted]) => ({
      consent_type,
      granted,
    })),
  };
}