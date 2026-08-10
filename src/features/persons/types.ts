export type PersonType = "INDIVIDUAL" | "ORGANIZATION";
export type PersonStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Person = {
  id: string;
  person_type: PersonType;
  full_name: string;
  preferred_name: string | null;
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  nationality: string | null;
  occupation: string | null;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  rg_issuer: string | null;
  nis: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  status: PersonStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PersonAddress = {
  id: string;
  address_type: string | null;
  postal_code: string | null;
  street: string | null;
  street_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state_code: string | null;
  country_code: string | null;
  is_primary: boolean | null;
};

export type PersonRelationship = {
  id: string;
  relationship_type: string | null;
  related_person_id: string | null;
  related_person?: { id?: string; full_name?: string; preferred_name?: string | null } | null;
  is_legal_guardian: boolean | null;
  is_financial_responsible: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type PersonsListResponse = {
  data: Person[];
  pagination: Pagination;
  filters?: { search: string | null; status: string | null; type: string | null };
};

export type PersonDetailResponse = {
  person: Person;
  addresses: PersonAddress[];
  relationships: PersonRelationship[];
};

export type PersonInput = {
  person_type: PersonType;
  full_name: string;
  preferred_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  rg?: string | null;
  rg_issuer?: string | null;
  nis?: string | null;
  primary_email?: string | null;
  primary_phone?: string | null;
  status: PersonStatus;
};

export type AddressInput = {
  address_type?: string | null;
  postal_code?: string | null;
  street?: string | null;
  street_number?: string | null;
  address_complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state_code?: string | null;
  country_code?: string | null;
  is_primary?: boolean;
};

export type RelationshipInput = {
  related_person_id: string;
  relationship_type: string;
  is_legal_guardian?: boolean;
  is_financial_responsible?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string | null;
};

export const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  INDIVIDUAL: "Pessoa física",
  ORGANIZATION: "Organização",
};

export const PERSON_STATUS_LABEL: Record<PersonStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado",
};

export const ADDRESS_TYPE_OPTIONS = [
  { value: "HOME", label: "Residencial" },
  { value: "WORK", label: "Comercial" },
  { value: "BILLING", label: "Cobrança" },
  { value: "OTHER", label: "Outro" },
];

export const RELATIONSHIP_TYPE_OPTIONS = [
  { value: "PARENT", label: "Pai/Mãe" },
  { value: "CHILD", label: "Filho(a)" },
  { value: "SPOUSE", label: "Cônjuge" },
  { value: "SIBLING", label: "Irmão/Irmã" },
  { value: "GUARDIAN", label: "Responsável" },
  { value: "OTHER", label: "Outro" },
];