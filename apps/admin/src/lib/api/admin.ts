import apiClient from "./client";
import type {
  AdminProjectSummary,
  Amenity,
  PaginatedResponse,
  ProjectReviewLog,
  ProjectReviewStatus,
} from "./schemas";

export const adminApi = {
  listAmenities: () =>
    apiClient.get<Amenity[]>("/admin/amenities").then((r) => r.data),

  createAmenity: (data: { name: string; icon?: string }) => {
    const body: { name: string; icon?: string } = { name: data.name };
    if (data.icon) body.icon = data.icon;
    return apiClient.post<Amenity>("/admin/amenities", body).then((r) => r.data);
  },

  deleteAmenity: (id: number) =>
    apiClient.delete(`/admin/amenities/${id}`).then((r) => r.data),

  // ── Review Queue ──────────────────────────────────────

  listReviewQueue: (params?: {
    reviewStatus?: ProjectReviewStatus;
    page?: number;
    limit?: number;
  }) => {
    const query: Record<string, string | number> = {};
    if (params?.reviewStatus) query.reviewStatus = params.reviewStatus;
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    return apiClient
      .get<PaginatedResponse<AdminProjectSummary>>("/admin/projects/review-queue", { params: query })
      .then((r) => r.data);
  },

  getProjectForReview: (id: string) =>
    apiClient.get<AdminProjectSummary>(`/admin/projects/${id}/review`).then((r) => r.data),

  approveProjectReview: (id: string, notes?: string) =>
    apiClient
      .post<AdminProjectSummary>(`/admin/projects/${id}/review/approve`, { notes })
      .then((r) => r.data),

  rejectProjectReview: (id: string, reason: string) =>
    apiClient
      .post<AdminProjectSummary>(`/admin/projects/${id}/review/reject`, { reason })
      .then((r) => r.data),

  addReviewNote: (id: string, notes: string) =>
    apiClient
      .post<AdminProjectSummary>(`/admin/projects/${id}/review/notes`, { notes })
      .then((r) => r.data),

  getReviewHistory: (id: string) =>
    apiClient.get<ProjectReviewLog[]>(`/admin/projects/${id}/review/history`).then((r) => r.data),
};
