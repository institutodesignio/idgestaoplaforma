import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  AddressInput,
  PersonAddress,
  PersonDetailResponse,
  PersonInput,
  PersonRelationship,
  PersonsListResponse,
  Person,
  RelationshipInput,
} from "./types";

export type PersonsListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
};

export function listPersons(params: PersonsListParams) {
  return apiGet<PersonsListResponse>("/api/v1/persons", {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: params.status || undefined,
    type: params.type || undefined,
  });
}

export function getPerson(id: string) {
  return apiGet<PersonDetailResponse>(`/api/v1/persons/${id}`);
}

export function createPerson(input: PersonInput) {
  return apiPost<{ person?: Person } | Person>("/api/v1/persons", input);
}

export function updatePerson(id: string, input: Partial<PersonInput>) {
  return apiPatch<{ person?: Person } | Person>(`/api/v1/persons/${id}`, input);
}

export function createAddress(personId: string, input: AddressInput) {
  return apiPost<{ address?: PersonAddress }>(`/api/v1/persons/${personId}/addresses`, input);
}

export function updateAddress(personId: string, addressId: string, input: AddressInput) {
  return apiPatch<{ address?: PersonAddress }>(
    `/api/v1/persons/${personId}/addresses/${addressId}`,
    input,
  );
}

export function createRelationship(personId: string, input: RelationshipInput) {
  return apiPost<{ relationship?: PersonRelationship }>(
    `/api/v1/persons/${personId}/relationships`,
    input,
  );
}

export function updateRelationship(
  personId: string,
  relationshipId: string,
  input: Partial<RelationshipInput>,
) {
  return apiPatch<{ relationship?: PersonRelationship }>(
    `/api/v1/persons/${personId}/relationships/${relationshipId}`,
    input,
  );
}

/** A API pode devolver { person } ou o próprio objeto. */
export function unwrapPerson(payload: { person?: Person } | Person): Person | null {
  if (!payload || typeof payload !== "object") return null;
  if ("person" in payload && payload.person) return payload.person;
  return "id" in payload ? (payload as Person) : null;
}