import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocument,
  listDocuments,
  listDocumentTemplates,
  getDocumentDownloadUrl,
  uploadDocumentVersion,
  updateDocument,
  type DocumentListParams,
} from "./api";
import type { DocumentInput, DocumentUpdate, InstitutionalDocument } from "./types";

export const documentKeys = {
  all: ["documents"] as const,
  list: (params: DocumentListParams) => ["documents", "list", params] as const,
  templates: ["document-templates"] as const,
};

export function useDocuments(params: DocumentListParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => listDocuments(params),
    retry: false,
  });
}

export function useDocumentTemplates() {
  return useQuery({
    queryKey: documentKeys.templates,
    queryFn: listDocumentTemplates,
    retry: false,
  });
}

export function useCreateDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: DocumentInput) => createDocument(input),
    onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useUpdateDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentUpdate }) => updateDocument(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useUploadDocumentVersion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ document, file }: { document: InstitutionalDocument; file: File }) =>
      uploadDocumentVersion(document, file),
    onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useDocumentDownload() {
  return useMutation({ mutationFn: (id: string) => getDocumentDownloadUrl(id) });
}
