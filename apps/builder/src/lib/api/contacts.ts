import apiClient from "./client";
import type { Contact } from "./schemas";

export interface CreateContactPayload {
  name: string;
  phone: string;
  designation?: string;
  email?: string;
  isPrimary?: boolean;
}

export const contactsApi = {
  listByProject: (projectId: string) =>
    apiClient
      .get<Contact[]>(`/projects/${projectId}/contacts`)
      .then((r) => r.data),

  create: (projectId: string, data: CreateContactPayload) =>
    apiClient
      .post<Contact>(`/projects/${projectId}/contacts`, data)
      .then((r) => r.data),

  update: (id: string, data: CreateContactPayload) =>
    apiClient.patch<Contact>(`/contacts/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/contacts/${id}`).then((r) => r.data),
};
