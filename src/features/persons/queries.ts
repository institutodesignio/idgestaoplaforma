import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  createPerson,
  createRelationship,
  getPerson,
  listPersons,
  updateAddress,
  updatePerson,
  updateRelationship,
  type PersonsListParams,
} from "./api";
import type { AddressInput, PersonInput, RelationshipInput } from "./types";

export const personKeys = {
  all: ["persons"] as const,
  list: (params: PersonsListParams) => ["persons", "list", params] as const,
  detail: (id: string) => ["persons", "detail", id] as const,
};

export function usePersonsList(params: PersonsListParams, enabled = true) {
  return useQuery({
    queryKey: personKeys.list(params),
    queryFn: () => listPersons(params),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function usePerson(id: string, enabled = true) {
  return useQuery({
    queryKey: personKeys.detail(id),
    queryFn: () => getPerson(id),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PersonInput) => createPerson(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personKeys.all }),
  });
}

export function useUpdatePerson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PersonInput>) => updatePerson(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personKeys.all }),
  });
}

export function useSaveAddress(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, input }: { addressId?: string; input: AddressInput }) =>
      addressId ? updateAddress(personId, addressId, input) : createAddress(personId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personKeys.detail(personId) }),
  });
}

export function useSaveRelationship(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relationshipId,
      input,
    }: {
      relationshipId?: string;
      input: RelationshipInput;
    }) =>
      relationshipId
        ? updateRelationship(personId, relationshipId, input)
        : createRelationship(personId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personKeys.detail(personId) }),
  });
}