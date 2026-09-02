import apiClient from "./client";
import type { BuilderProfile, BuilderReview } from "./schemas";

export interface UpdateBuilderPayload {
  companyName?: string;
  reraNumber?: string;
  gstNumber?: string;
  logo?: string;
  yearsInBusiness?: number;
  totalProjectsCompleted?: number;
  onTimeDeliveryRate?: number;
}

export interface PortfolioPayload {
  title: string;
  city: string;
  completionYear?: number;
  unitsCount?: number;
  deliveredOnTime?: boolean;
  coverImageUrl?: string;
  description?: string;
}

export interface PortfolioItem extends PortfolioPayload {
  id: string;
  builderId: string;
  deliveredOnTime: boolean;
  createdAt: string;
}

export const builderProfileApi = {
  getProfile: () =>
    apiClient.get<BuilderProfile>("/builders/me").then((r) => r.data),

  updateProfile: (data: UpdateBuilderPayload) =>
    apiClient.patch<BuilderProfile>("/builders/me", data).then((r) => r.data),

  uploadDocument: (file: File, onUploadProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<{ url: string; type: string }>("/builders/me/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  uploadLogo: (file: File, onUploadProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<BuilderProfile>("/builders/me/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  listPortfolio: () =>
    apiClient.get<PortfolioItem[]>("/builders/me/portfolio").then((r) => r.data),

  createPortfolio: (data: PortfolioPayload) =>
    apiClient
      .post<PortfolioItem>("/builders/me/portfolio", data)
      .then((r) => r.data),

  updatePortfolio: (id: string, data: Partial<PortfolioPayload>) =>
    apiClient
      .patch<PortfolioItem>(`/builders/me/portfolio/${id}`, data)
      .then((r) => r.data),

  deletePortfolio: (id: string) =>
    apiClient.delete(`/builders/me/portfolio/${id}`).then((r) => r.data),

  listReviews: () =>
    apiClient.get<BuilderReview[]>("/builders/me/reviews").then((r) => r.data),
};
