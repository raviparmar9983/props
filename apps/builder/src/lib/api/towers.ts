import apiClient from "./client";
import type { Tower } from "./schemas";

export interface CreateTowerPayload {
  name: string;
  totalFloors?: number;
}

export const towersApi = {
  listByProject: (projectId: string) =>
    apiClient.get<Tower[]>(`/projects/${projectId}/towers`).then((r) => r.data),

  create: (projectId: string, data: CreateTowerPayload) =>
    apiClient
      .post<Tower>(`/projects/${projectId}/towers`, data)
      .then((r) => r.data),

  update: (id: string, data: CreateTowerPayload) =>
    apiClient.patch<Tower>(`/towers/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/towers/${id}`).then((r) => r.data),
};
