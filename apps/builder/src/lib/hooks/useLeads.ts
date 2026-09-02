import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api";
import type { ListLeadsParams, UpdateLeadStatusPayload } from "../api/leads";
import type { LeadStatus } from "../api/schemas";

export function useLeads(params?: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => leadsApi.list(params),
    staleTime: 30_000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => leadsApi.getOne(id),
    enabled: !!id,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLeadStatusPayload;
    }) => leadsApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", id] });
    },
  });
}
