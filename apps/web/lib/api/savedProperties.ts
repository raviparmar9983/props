import apiClient from "./client";
import type { PaginatedResponse, SavedPropertyItem } from "../../types/public";

export const savedPropertiesApi = {
  save: (projectId: string) =>
    apiClient.post(`/saved-properties/${projectId}`).then((r) => r.data),

  unsave: (projectId: string) =>
    apiClient.delete(`/saved-properties/${projectId}`).then((r) => r.data),

  listMine: () =>
    apiClient
      .get<PaginatedResponse<SavedPropertyItem>>("/saved-properties/mine")
      .then((r) => r.data),
};
