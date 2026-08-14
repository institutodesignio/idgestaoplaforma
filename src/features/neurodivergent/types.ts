export type IntakeStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "DUPLICATE" | "ARCHIVED";

export type IntakeRespondentRole =
  | "SELF"
  | "MOTHER_FATHER"
  | "LEGAL_GUARDIAN"
  | "CAREGIVER_SUPPORTER"
  | "OTHER";

export type IntakeChannel = "IN_PERSON" | "PAPER" | "SITE";

export type ConsentRole = "SELF_ADULT" | "MOTHER_FATHER" | "LEGAL_GUARDIAN";

export type CommunicationChannel = "WHATSAPP" | "PHONE" | "EMAIL";

export type IntakeDataConsent = {
  id: string;
  consented_by_person_id: string | null;
  consent_role: ConsentRole | string | null;
  term_version: string | null;
  assent_recorded: boolean | null;
  communication_channels: string[] | null;
  signed_at: string | null;
  revoked_at: string | null;
};

export type NeurodivergentProfile = {
  id?: string;
  identification_status?: string | null;
  conditions?: string[] | null;
  other_condition?: string | null;
  report_status?: string | null;
  education_statuses?: string[] | null;
  education_institution?: string | null;
  school_support_needed?: string | null;
  employment_status?: string | null;
  service_networks?: string[] | null;
  current_services?: string | null;
  waiting_for_service?: boolean | null;
  waiting_details?: string | null;
  priority_needs?: string[] | null;
  primary_need_barrier?: string | null;
  accessibility_supports?: string[] | null;
  accessibility_other?: string | null;
};

export type NeurodivergentIntake = {
  id: string;
  protocol?: string | null;
  status: IntakeStatus | string;
  person_id: string | null;
  respondent_person_id?: string | null;
  respondent_role?: IntakeRespondentRole | string | null;
  respondent_relationship?: string | null;
  channel?: IntakeChannel | string | null;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  neurodivergent_profiles?: NeurodivergentProfile[] | null;
  data_consents?: IntakeDataConsent[] | null;
};

export type IntakeProfileInput = {
  identification_status: string;
  conditions: string[];
  other_condition?: string | null;
  report_status: string;
  education_statuses: string[];
  education_institution?: string | null;
  school_support_needed?: string | null;
  employment_status?: string | null;
  service_networks: string[];
  current_services?: string | null;
  waiting_for_service?: boolean | null;
  waiting_details?: string | null;
  priority_needs: string[];
  primary_need_barrier: string;
  accessibility_supports: string[];
  accessibility_other?: string | null;
};

export type IntakeConsentInput = {
  consented_by_person_id: string;
  consent_role: ConsentRole;
  term_version: string;
  sensitive_data_consent: true;
  assent_recorded: boolean;
  communication_channels: CommunicationChannel[];
  /** ISO 8601 com offset. */
  signed_at: string;
};

export type IntakeSubmitInput = {
  person_id: string;
  respondent_person_id?: string | null;
  respondent_role: IntakeRespondentRole;
  respondent_relationship?: string | null;
  channel: IntakeChannel;
  profile: IntakeProfileInput;
  consent: IntakeConsentInput;
};

export const INTAKE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Recebido",
  REVIEWED: "Revisado",
  DUPLICATE: "Duplicado",
  ARCHIVED: "Arquivado",
};

export const INTAKE_STATUS_OPTIONS = Object.entries(INTAKE_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export const RESPONDENT_ROLE_OPTIONS = [
  { value: "SELF", label: "A própria pessoa" },
  { value: "MOTHER_FATHER", label: "Mãe ou pai" },
  { value: "LEGAL_GUARDIAN", label: "Responsável legal" },
  { value: "CAREGIVER_SUPPORTER", label: "Cuidador(a) ou apoiador(a)" },
  { value: "OTHER", label: "Outro vínculo" },
];

export const CHANNEL_OPTIONS = [
  { value: "IN_PERSON", label: "Presencial" },
  { value: "PAPER", label: "Formulário em papel" },
  { value: "SITE", label: "Site" },
];

export const IDENTIFICATION_STATUS_OPTIONS = [
  { value: "DIAGNOSED", label: "Diagnóstico concluído" },
  { value: "UNDER_EVALUATION", label: "Em avaliação" },
  { value: "SELF_IDENTIFIED_SUSPECTED", label: "Autoidentificação ou suspeita" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiro não informar" },
];

export const CONDITION_OPTIONS = [
  { value: "AUTISM", label: "Autismo" },
  { value: "ADHD", label: "TDAH" },
  { value: "DYSLEXIA", label: "Dislexia" },
  { value: "DYSCALCULIA", label: "Discalculia" },
  { value: "DCD_DYSPRAXIA", label: "TDC / Dispraxia" },
  { value: "TOURETTE", label: "Síndrome de Tourette" },
  { value: "GIFTEDNESS", label: "Altas habilidades" },
  { value: "INTELLECTUAL_DISABILITY", label: "Deficiência intelectual" },
  { value: "OTHER", label: "Outra condição" },
];

export const REPORT_STATUS_OPTIONS = [
  { value: "YES", label: "Possui laudo ou relatório" },
  { value: "NO", label: "Não possui" },
  { value: "IN_PROGRESS", label: "Em elaboração" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiro não informar" },
];

export const EDUCATION_STATUS_OPTIONS = [
  { value: "EARLY_CHILDHOOD", label: "Educação infantil" },
  { value: "ELEMENTARY", label: "Ensino fundamental" },
  { value: "HIGH_SCHOOL", label: "Ensino médio" },
  { value: "EJA", label: "EJA" },
  { value: "HIGHER_TECHNICAL", label: "Superior ou técnico" },
  { value: "NOT_ENROLLED", label: "Fora da escola" },
  { value: "NOT_APPLICABLE", label: "Não se aplica" },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "WORKING", label: "Trabalhando" },
  { value: "SEEKING_WORK", label: "Procurando trabalho" },
  { value: "ON_LEAVE", label: "Afastado(a)" },
  { value: "RETIRED", label: "Aposentado(a)" },
  { value: "NOT_WORKING", label: "Não trabalha" },
  { value: "NOT_APPLICABLE", label: "Não se aplica" },
];

export const SERVICE_NETWORK_OPTIONS = [
  { value: "SUS", label: "SUS" },
  { value: "EDUCATION", label: "Educação" },
  { value: "SOCIAL_ASSISTANCE", label: "Assistência social" },
  { value: "PRIVATE_INSURANCE", label: "Plano de saúde" },
  { value: "NGO", label: "Organização da sociedade civil" },
  { value: "NONE", label: "Nenhuma rede" },
];

export const PRIORITY_NEED_OPTIONS = [
  { value: "ASSESSMENT_DIAGNOSIS", label: "Avaliação e diagnóstico" },
  { value: "PSYCHOLOGY", label: "Psicologia" },
  { value: "SPEECH_THERAPY", label: "Fonoaudiologia" },
  { value: "OCCUPATIONAL_THERAPY", label: "Terapia ocupacional" },
  { value: "PHYSIOTHERAPY", label: "Fisioterapia" },
  { value: "PSYCHOPEDAGOGY", label: "Psicopedagogia" },
  { value: "SCHOOL_SUPPORT", label: "Apoio escolar" },
  { value: "PROFESSIONAL_INCLUSION", label: "Inclusão profissional" },
  { value: "FAMILY_GUIDANCE", label: "Orientação familiar" },
  { value: "BENEFITS_RIGHTS", label: "Benefícios e direitos" },
  { value: "SOCIAL_LEISURE", label: "Convivência e lazer" },
  { value: "TRANSPORT", label: "Transporte" },
  { value: "OTHER", label: "Outra necessidade" },
];

export const ACCESSIBILITY_SUPPORT_OPTIONS = [
  { value: "PLAIN_LANGUAGE", label: "Linguagem simples" },
  { value: "VISUAL_SUPPORT", label: "Apoio visual" },
  { value: "SENSORY_ADAPTED_ENVIRONMENT", label: "Ambiente com adaptação sensorial" },
  { value: "INTERPRETER", label: "Intérprete" },
  { value: "COMPANION", label: "Acompanhante" },
  { value: "MOBILITY", label: "Mobilidade" },
  { value: "OTHER", label: "Outro apoio" },
];

export const CONSENT_ROLE_OPTIONS = [
  { value: "SELF_ADULT", label: "A própria pessoa (adulta)" },
  { value: "MOTHER_FATHER", label: "Mãe ou pai" },
  { value: "LEGAL_GUARDIAN", label: "Responsável legal" },
];

export const COMMUNICATION_CHANNEL_OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Telefone" },
  { value: "EMAIL", label: "E-mail" },
];

export const MAX_PRIORITY_NEEDS = 5;

/** Versão do termo apresentada no acolhimento presencial. */
export const CONSENT_TERM_VERSION = "v1";

export function intakeProtocol(intake: NeurodivergentIntake): string {
  return intake.protocol ?? intake.id;
}

export function labelFor(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function labelsFor(options: { value: string; label: string }[], values: string[]): string {
  return values.map((value) => labelFor(options, value)).join(", ");
}
