import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api";
import type { SubmitLeadPayload } from "../api/leads";

export function useSubmitLead() {
  return useMutation({
    mutationFn: (payload: SubmitLeadPayload) => leadsApi.submit(payload),
  });
}
