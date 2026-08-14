export type UnitStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Unit = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  postal_code?: string | null;
  street?: string | null;
  street_number?: string | null;
  address_complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state_code?: string | null;
  country_code?: string | null;
  is_headquarters: boolean | null;
  status: UnitStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UnitInput = {
  name: string;
  slug?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  postal_code?: string | null;
  street?: string | null;
  street_number?: string | null;
  address_complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state_code?: string | null;
  country_code?: string | null;
  is_headquarters?: boolean;
  status?: UnitStatus;
};

export const UNIT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  INACTIVE: "Inativa",
  ARCHIVED: "Arquivada",
};
