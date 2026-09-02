import type { PROJECT_STATUSES, USER_ROLES } from "@real-estate/constants";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; limit: number };
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface ProjectSummary {
  id: string;
  builderId: string;
  name: string;
  slug: string;
  city: string;
  status: ProjectStatus;
  description: string;
}
export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}
