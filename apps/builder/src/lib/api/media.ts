import apiClient from "./client";
import type { ProjectMedia, MediaType } from "./schemas";

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export const mediaApi = {
  listByProject: (projectId: string) =>
    apiClient
      .get<ProjectMedia[]>(`/projects/${projectId}/media`)
      .then((r) => r.data),

  upload: (
    projectId: string,
    file: File,
    type: MediaType,
    unitTypeId?: string,
    onUploadProgress?: (pct: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    const params: Record<string, string> = { type };
    if (unitTypeId) params.unitTypeId = unitTypeId;
    return apiClient
      .post<ProjectMedia>(`/projects/${projectId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params,
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  delete: (id: string) =>
    apiClient.delete(`/media/${id}`).then((r) => r.data),

  reorder: (projectId: string, order: ReorderItem[]) =>
    apiClient
      .patch(`/projects/${projectId}/media/reorder`, { order })
      .then((r) => r.data),

  setPrimary: (projectId: string, mediaId: string) =>
    apiClient
      .patch<ProjectMedia>(
        `/projects/${projectId}/media/${mediaId}/primary`,
      )
      .then((r) => r.data),
};
