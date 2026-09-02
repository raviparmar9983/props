import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "../api";
import type { CreateContactPayload } from "../api/contacts";

export function useContacts(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "contacts"],
    queryFn: () => contactsApi.listByProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateContactPayload;
    }) => contactsApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "contacts"],
      });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateContactPayload }) =>
      contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
