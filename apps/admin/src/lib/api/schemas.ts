export type UserRole = "ADMIN" | "BUILDER" | "CUSTOMER";

export type BuilderVerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export type ProjectReviewStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface AdminBuilderUser {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCity {
  id: string;
  name: string;
  slug: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AdminBuilder {
  id: string;
  userId: string;
  companyName: string;
  slug: string;
  reraNumber: string | null;
  gstNumber: string | null;
  cityId: string;
  phone: string | null;
  verificationStatus: BuilderVerificationStatus;
  verificationDocs: unknown;
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedById: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminBuilderUser;
  city: AdminCity;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface AdminProjectSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  reviewStatus: ProjectReviewStatus;
  verificationStatus: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  builder: {
    id: string;
    companyName: string;
    slug?: string;
    verificationStatus?: string;
    reraNumber?: string | null;
    yearsInBusiness?: number | null;
    totalProjectsCompleted?: number | null;
    onTimeDeliveryRate?: number | null;
  };
  city: { id: string; name: string; slug?: string };
  locality: { id: string; name: string };
  media: string[];
  unitTypes: { price: number }[];
  priceStartingFrom: number | null;
  rejectionReason: string | null;
  reviewNotes: string | null;
  _count: { leads: number; unitTypes: number; media?: number };
}

export interface ProjectReviewLog {
  id: string;
  projectId: string;
  action: ProjectReviewStatus;
  reason: string | null;
  notes: string | null;
  reviewedBy: string;
  createdAt: string;
}
