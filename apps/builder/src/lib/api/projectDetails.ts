import apiClient from "./client";
import type {
  NearbyLandmark,
  PriceComponent,
  PaymentPlan,
  BankPartner,
  ConstructionUpdate,
  SpecificationItem,
  ProjectFAQ,
  SiteVisitBooking,
  LandmarkCategory,
  PaymentPlanType,
  SpecCategory,
  SiteVisitStatus,
} from "./schemas";
import type { PaginatedResponse } from "./schemas";

export interface LandmarkPayload {
  category: LandmarkCategory;
  name: string;
  distanceKm: number;
  travelTimeMinutes?: number;
}

export interface PriceComponentPayload {
  label: string;
  amount: number;
  isIncludedInBasePrice?: boolean;
  displayOrder?: number;
}

export interface PaymentPlanPayload {
  name: string;
  type: PaymentPlanType;
  bookingAmount: number;
  milestones: Record<string, unknown>[];
}

export interface BankPartnerPayload {
  bankName: string;
  logoUrl?: string;
}

export interface ConstructionUpdatePayload {
  title: string;
  description?: string;
  updateDate: string;
  progressPercent?: number;
}

export interface SpecificationPayload {
  category: SpecCategory;
  label: string;
  value: string;
}

export interface FaqPayload {
  question: string;
  answer: string;
  displayOrder?: number;
}

export type UpdateLandmarkPayload = Partial<LandmarkPayload>;
export type UpdatePriceComponentPayload = Partial<PriceComponentPayload>;
export type UpdatePaymentPlanPayload = Partial<PaymentPlanPayload>;
export type UpdateBankPartnerPayload = Partial<BankPartnerPayload>;
export type UpdateConstructionUpdatePayload = Partial<ConstructionUpdatePayload>;
export type UpdateSpecificationPayload = Partial<SpecificationPayload>;
export type UpdateFaqPayload = Partial<FaqPayload>;

function crud<T, Create, Update>(base: string, projectPath: string) {
  return {
    list: (projectId: string) =>
      apiClient
        .get<T[]>(`/projects/${projectId}/${projectPath}`)
        .then((r) => r.data),
    create: (projectId: string, data: Create) =>
      apiClient
        .post<T>(`/projects/${projectId}/${projectPath}`, data)
        .then((r) => r.data),
    update: (id: string, data: Update) =>
      apiClient.patch<T>(`/${base}/${id}`, data).then((r) => r.data),
    remove: (id: string) =>
      apiClient.delete(`/${base}/${id}`).then((r) => r.data),
  };
}

export const landmarksApi = crud<NearbyLandmark, LandmarkPayload, UpdateLandmarkPayload>("landmarks", "landmarks");
export const priceComponentsApi = crud<PriceComponent, PriceComponentPayload, UpdatePriceComponentPayload>("price-components", "price-components");
export const paymentPlansApi = crud<PaymentPlan, PaymentPlanPayload, UpdatePaymentPlanPayload>("payment-plans", "payment-plans");
export const bankPartnersApi = crud<BankPartner, BankPartnerPayload, UpdateBankPartnerPayload>("bank-partners", "bank-partners");
export const specificationsApi = crud<SpecificationItem, SpecificationPayload, UpdateSpecificationPayload>("specifications", "specifications");
export const faqsApi = crud<ProjectFAQ, FaqPayload, UpdateFaqPayload>("faqs", "faqs");

export const constructionUpdatesApi = {
  list: (projectId: string) =>
    apiClient
      .get<ConstructionUpdate[]>(`/projects/${projectId}/construction-updates`)
      .then((r) => r.data),
  create: (projectId: string, data: ConstructionUpdatePayload, file?: File) => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    return apiClient
      .post<ConstructionUpdate>(
        `/projects/${projectId}/construction-updates`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((r) => r.data);
  },
  update: (id: string, data: UpdateConstructionUpdatePayload, file?: File) => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    return apiClient
      .patch<ConstructionUpdate>(`/construction-updates/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  remove: (id: string) =>
    apiClient.delete(`/construction-updates/${id}`).then((r) => r.data),
};

export interface SiteVisitQuery {
  projectId?: string;
  status?: SiteVisitStatus;
  page?: number;
  limit?: number;
}

export const siteVisitsApi = {
  list: (params?: SiteVisitQuery) =>
    apiClient
      .get<PaginatedResponse<SiteVisitBooking>>("/site-visits", { params })
      .then((r) => r.data),
  updateStatus: (id: string, status: SiteVisitStatus) =>
    apiClient
      .patch<SiteVisitBooking>(`/site-visits/${id}/status`, { status })
      .then((r) => r.data),
};
