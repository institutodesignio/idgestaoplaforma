export type DocumentStatus =
  "DRAFT" | "READY_FOR_APPROVAL" | "APPROVED" | "SIGNED" | "ARCHIVED" | "VOID";

export type DocumentClassification = "INTERNAL" | "CONFIDENTIAL" | "CLINICAL" | "FINANCIAL";

export type InstitutionalDocument = {
  id: string;
  template_id?: string | null;
  person_id?: string | null;
  project_id?: string | null;
  unit_id?: string | null;
  category: string;
  classification: DocumentClassification | string;
  title: string;
  description?: string | null;
  status: DocumentStatus | string;
  current_version: number;
  approved_at?: string | null;
  signed_at?: string | null;
  void_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DocumentInput = {
  template_id?: string | null;
  person_id?: string | null;
  project_id?: string | null;
  unit_id?: string | null;
  category: string;
  classification?: DocumentClassification;
  title: string;
  description?: string | null;
};

export type DocumentUpdate = {
  title?: string;
  description?: string | null;
  status?: DocumentStatus;
  void_reason?: string | null;
};

export type DocumentTemplate = {
  id: string;
  code: string;
  title: string;
  category: string;
  version: number;
  status: string;
  requires_approval: boolean;
  requires_signature: boolean;
};

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const DOCUMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  READY_FOR_APPROVAL: "Aguardando aprovação",
  APPROVED: "Aprovado",
  SIGNED: "Assinado",
  ARCHIVED: "Arquivado",
  VOID: "Anulado",
};

export const DOCUMENT_STATUS_OPTIONS = Object.entries(DOCUMENT_STATUS_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const DOCUMENT_CLASSIFICATION_LABEL: Record<string, string> = {
  INTERNAL: "Interno",
  CONFIDENTIAL: "Confidencial",
  CLINICAL: "Clínico",
  FINANCIAL: "Financeiro",
};
