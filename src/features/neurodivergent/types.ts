export type IntakeStatus = "SUBMITTED" | "IN_REVIEW" | "VALIDATED" | "ARCHIVED";

export type IntakeConsent = {
  id: string;
  consent_type: string | null;
  purpose?: string | null;
  granted: boolean | null;
  granted_at: string | null;
  revoked_at: string | null;
};

export type NeurodivergentIntake = {
  id: string;
  protocol?: string | null;
  protocol_number?: string | null;
  status: IntakeStatus | string;
  person_id: string | null;
  person?: { id?: string; full_name?: string | null } | null;
  full_name?: string | null;
  city: string | null;
  state_code: string | null;
  neighborhood?: string | null;
  conditions?: string[] | null;
  support_level?: string | null;
  diagnosis_status?: string | null;
  education_status?: string | null;
  work_status?: string | null;
  support_network?: string[] | null;
  priority_needs?: string[] | null;
  guardians?: {
    id?: string;
    full_name?: string | null;
    relationship?: string | null;
    phone?: string | null;
    email?: string | null;
  }[] | null;
  consents?: IntakeConsent[] | null;
  submitted_at?: string | null;
  created_at?: string | null;
};

export type IntakeGuardianInput = {
  full_name: string;
  relationship: string;
  phone?: string | null;
  email?: string | null;
  is_legal_guardian?: boolean;
};

export type IntakeSubmitInput = {
  person: {
    person_id?: string | null;
    full_name: string;
    preferred_name?: string | null;
    birth_date?: string | null;
    primary_phone?: string | null;
    primary_email?: string | null;
  };
  territory: {
    postal_code?: string | null;
    city: string;
    state_code: string;
    neighborhood?: string | null;
  };
  profile: {
    conditions: string[];
    diagnosis_status: string;
    support_level?: string | null;
    communication_notes?: string | null;
  };
  education_work: {
    education_status: string;
    school_name?: string | null;
    has_school_support?: boolean;
    work_status: string;
  };
  network_needs: {
    support_network: string[];
    priority_needs: string[];
    additional_notes?: string | null;
  };
  guardians: IntakeGuardianInput[];
  consents: { consent_type: string; granted: boolean }[];
};

export const INTAKE_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Recebido",
  IN_REVIEW: "Em análise",
  VALIDATED: "Validado",
  ARCHIVED: "Arquivado",
};

export const INTAKE_STATUS_OPTIONS = Object.entries(INTAKE_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const CONDITION_OPTIONS = [
  { value: "AUTISM", label: "Autismo" },
  { value: "ADHD", label: "TDAH" },
  { value: "DYSLEXIA", label: "Dislexia" },
  { value: "DYSCALCULIA", label: "Discalculia" },
  { value: "INTELLECTUAL_DISABILITY", label: "Deficiência intelectual" },
  { value: "TOURETTE", label: "Síndrome de Tourette" },
  { value: "OTHER", label: "Outra condição" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

export const DIAGNOSIS_STATUS_OPTIONS = [
  { value: "DIAGNOSED", label: "Diagnóstico concluído" },
  { value: "IN_INVESTIGATION", label: "Em investigação" },
  { value: "SELF_IDENTIFIED", label: "Autoidentificação" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

export const SUPPORT_LEVEL_OPTIONS = [
  { value: "LOW", label: "Apoio pontual" },
  { value: "MODERATE", label: "Apoio frequente" },
  { value: "HIGH", label: "Apoio contínuo" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

export const EDUCATION_STATUS_OPTIONS = [
  { value: "EARLY_CHILDHOOD", label: "Educação infantil" },
  { value: "ELEMENTARY", label: "Ensino fundamental" },
  { value: "HIGH_SCHOOL", label: "Ensino médio" },
  { value: "HIGHER_EDUCATION", label: "Ensino superior" },
  { value: "OUT_OF_SCHOOL", label: "Fora da escola" },
  { value: "COMPLETED", label: "Estudos concluídos" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

export const WORK_STATUS_OPTIONS = [
  { value: "EMPLOYED", label: "Trabalho formal" },
  { value: "INFORMAL", label: "Trabalho informal" },
  { value: "SEEKING", label: "Procurando trabalho" },
  { value: "NOT_WORKING", label: "Não trabalha" },
  { value: "STUDENT", label: "Somente estudando" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

export const SUPPORT_NETWORK_OPTIONS = [
  { value: "FAMILY", label: "Família" },
  { value: "SCHOOL", label: "Escola" },
  { value: "HEALTH_SERVICE", label: "Serviço de saúde" },
  { value: "SOCIAL_ASSISTANCE", label: "Assistência social" },
  { value: "COMMUNITY", label: "Comunidade ou coletivo" },
  { value: "NONE", label: "Sem rede de apoio" },
];

export const PRIORITY_NEED_OPTIONS = [
  { value: "DIAGNOSTIC_SUPPORT", label: "Apoio diagnóstico" },
  { value: "THERAPY", label: "Acompanhamento terapêutico" },
  { value: "SCHOOL_INCLUSION", label: "Inclusão escolar" },
  { value: "FAMILY_GUIDANCE", label: "Orientação familiar" },
  { value: "INCOME_SUPPORT", label: "Apoio de renda ou benefícios" },
  { value: "WORK_INCLUSION", label: "Inclusão no trabalho" },
  { value: "LEGAL_GUIDANCE", label: "Orientação jurídica" },
  { value: "LEISURE_CULTURE", label: "Lazer e cultura" },
];

export const MAX_PRIORITY_NEEDS = 5;

export const CONSENT_DEFINITIONS = [
  {
    type: "DATA_PROCESSING",
    label: "Autorizo o tratamento dos dados informados",
    description:
      "Necessário para que o Instituto Designio registre o cadastro e organize o acolhimento.",
    required: true,
  },
  {
    type: "SENSITIVE_DATA",
    label: "Autorizo o registro de dados sensíveis de saúde e neurodivergência",
    description: "Usado apenas para planejar o cuidado e as necessidades de apoio.",
    required: true,
  },
  {
    type: "CONTACT",
    label: "Autorizo contato para acompanhamento",
    description: "Podemos entrar em contato para orientar e acompanhar as demandas.",
    required: false,
  },
  {
    type: "ANONYMIZED_INDICATORS",
    label: "Autorizo o uso dos dados de forma agregada e anônima em indicadores",
    description: "Os indicadores nunca identificam pessoas.",
    required: false,
  },
];

export function intakeProtocol(intake: NeurodivergentIntake): string {
  return intake.protocol ?? intake.protocol_number ?? intake.id;
}

export function intakeName(intake: NeurodivergentIntake): string {
  return intake.person?.full_name ?? intake.full_name ?? "Cadastro sem identificação";
}

export function labelFor(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}