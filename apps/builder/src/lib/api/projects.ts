import apiClient from "./client";
import type { PaginatedResponse, ProjectSummary, ProjectDetail } from "./schemas";
import type {
  ReraStatus,
  CertificateStatus,
  LandTitleType,
  LitigationStatus,
} from "./schemas";

export interface CreateProjectPayload {
  title: string;
  cityId: string;
  localityId: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  reraProjectNumber?: string;
  possessionDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  isFeatured?: boolean;
  reraStatus?: ReraStatus;
  reraPortalUrl?: string;
  occupancyCertStatus?: CertificateStatus;
  commencementCertStatus?: CertificateStatus;
  landTitleType?: LandTitleType;
  litigationStatus?: LitigationStatus;
  litigationDetails?: string;
  structureType?: string;
  powerBackupCapacity?: string;
  waterSource?: string;
  liftBrand?: string;
  liftCount?: number;
  fireSafetyCompliant?: boolean;
  openSpacePercent?: number;
  greenAreaPercent?: number;
  hasCctv?: boolean;
  hasGatedEntry?: boolean;
  securityGuardCount?: number;
  petPolicy?: string;
  neighborhoodOverview?: string;
  videoWalkthroughUrl?: string;
  virtualTour3dUrl?: string;
  allowsSiteVisitBooking?: boolean;
}

export interface ListProjectsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface UpdateProjectAmenitiesPayload {
  amenityIds: number[];
}

export const projectsApi = {
  create: (data: CreateProjectPayload) =>
    apiClient.post<ProjectDetail>("/projects", data).then((r) => r.data),

  listMine: (params?: ListProjectsParams) =>
    apiClient
      .get<PaginatedResponse<ProjectSummary>>("/projects/mine", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<ProjectDetail>(`/projects/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateProjectPayload) =>
    apiClient.patch<ProjectDetail>(`/projects/${id}`, data).then((r) => r.data),

  softDelete: (id: string) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),

  publish: (id: string) =>
    apiClient.patch<ProjectDetail>(`/projects/${id}/publish`).then((r) => r.data),

  unpublish: (id: string) =>
    apiClient
      .patch<ProjectDetail>(`/projects/${id}/unpublish`)
      .then((r) => r.data),

  updateAmenities: (id: string, data: UpdateProjectAmenitiesPayload) =>
    apiClient
      .put<{ message: string; amenityIds: number[] }>(
        `/projects/${id}/amenities`,
        data,
      )
      .then((r) => r.data),
};
