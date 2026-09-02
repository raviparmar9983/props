import apiClient from "./client";
import type { Lead, LeadStatus, PaginatedResponse } from "./schemas";

export interface ListLeadsParams {
  status?: LeadStatus;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
}

export const leadsApi = {
  list: (params?: ListLeadsParams) =>
    apiClient
      .get<PaginatedResponse<Lead>>("/leads", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<Lead>(`/leads/${id}`).then((r) => r.data),

  updateStatus: (id: string, data: UpdateLeadStatusPayload) =>
    apiClient.patch<Lead>(`/leads/${id}/status`, data).then((r) => r.data),
};
