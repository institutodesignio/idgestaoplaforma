import { ApiError, apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  DocumentInput,
  DocumentTemplate,
  DocumentUpdate,
  InstitutionalDocument,
} from "./types";

export type DocumentListParams = {
  status?: string;
  category?: string;
  classification?: string;
  person_id?: string;
  project_id?: string;
};

export function listDocuments(params: DocumentListParams) {
  return apiGet<{ data: InstitutionalDocument[] }>("/api/v1/documents", params);
}

export function listDocumentTemplates() {
  return apiGet<{ data: DocumentTemplate[] }>("/api/v1/document-templates");
}

export function createDocument(input: DocumentInput) {
  return apiPost<{ data: InstitutionalDocument }>("/api/v1/documents", input);
}

export function updateDocument(id: string, input: DocumentUpdate) {
  return apiPatch<{ data: InstitutionalDocument }>(`/api/v1/documents/${id}`, input);
}

type SignedUpload = { signedUrl?: string; signed_url?: string; path: string; token?: string };

async function checksumSha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Upload em duas etapas: URL temporária da API, depois registro da versão. */
export async function uploadDocumentVersion(
  document: Pick<InstitutionalDocument, "id" | "current_version">,
  file: File,
) {
  const versionNumber = document.current_version + 1;
  const response = await apiPost<{ data: SignedUpload }>(
    `/api/v1/documents/${document.id}/upload-url`,
    { version_number: versionNumber, filename: file.name, mime_type: file.type },
  );
  const signedUrl = response.data.signedUrl ?? response.data.signed_url;
  if (!signedUrl)
    throw new ApiError("temporary", "O servidor não forneceu a URL temporária de envio.");

  let upload: Response;
  try {
    upload = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type, "x-upsert": "false" },
      body: file,
    });
  } catch {
    throw new ApiError("temporary", "Não foi possível enviar o arquivo pela URL temporária.");
  }
  if (!upload.ok)
    throw new ApiError("temporary", "O armazenamento recusou o envio do arquivo.", upload.status);

  return apiPost(`/api/v1/documents/${document.id}/versions`, {
    original_filename: file.name,
    mime_type: file.type,
    file_size_bytes: file.size,
    checksum_sha256: await checksumSha256(file),
    change_summary: `Arquivo ${file.name} enviado pela interface institucional.`,
  });
}

export function getDocumentDownloadUrl(id: string) {
  return apiGet<{ data: { signedUrl?: string; signed_url?: string; expires_in_seconds: number } }>(
    `/api/v1/documents/${id}/download-url`,
  );
}
