export interface PublicProjectSummary {
  id: string;
  slug: string;
  title: string;
  city: string;
  locality: string;
  builder: {
    companyName: string;
    slug: string;
    logo: string | null;
  };
  priceStartingFrom: number | null;
  propertyTypes: string[];
  primaryImageUrl: string | null;
  media: string[];
  status: string;
  isFeatured: boolean;
}

export interface PublicProjectDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  city: { id: string; name: string; slug: string };
  locality: { id: string; name: string; slug: string };
  status: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  reraProjectNumber: string | null;
  possessionDate: string | null;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  builder: {
    id: string;
    companyName: string;
    slug: string;
    logo: string | null;
    verificationStatus: string;
    yearsInBusiness: number | null;
    totalProjectsCompleted: number | null;
    onTimeDeliveryRate: number | null;
    reviewsSummary: { averageRating: number | null; count: number };
  };
  towers: {
    id: string;
    name: string;
    totalFloors: number | null;
  }[];
  unitTypes: UnitTypeSummary[];
  media: { id: string; type: string; url: string; isPrimary: boolean; displayOrder: number }[];
  amenities: { amenity: { id: number; name: string; icon: string | null } }[];
  landmarks: NearbyLandmark[];
  priceComponents: PriceComponent[];
  paymentPlans: PaymentPlan[];
  bankPartners: BankPartner[];
  constructionUpdates: ConstructionUpdate[];
  specifications: SpecificationItem[];
  faqs: ProjectFaq[];
}

export interface ProjectContact {
  projectId: string;
  builder: {
    id: string;
    companyName: string;
    phone: string | null;
    email: string | null;
  };
  contacts: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    designation: string | null;
    isPrimary: boolean;
  }[];
}

export interface UnitTypeSummary {
  id: string;
  propertyType: string;
  label: string;
  towerId: string | null;
  tower: { id: string; name: string } | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  areaUnit: string;
  price: number;
  priceUnit: string;
  totalCount: number;
  availableCount: number;
  attributes: Record<string, unknown> | null;
  floorNumber: string | null;
  facing: string | null;
  viewType: string | null;
  bookingAmount: number | string | null;
  floorPlanImageUrl: string | null;
}

export interface NearbyLandmark {
  id: string;
  category: string;
  name: string;
  distanceKm: number;
  travelTimeMinutes: number | null;
}

export interface PriceComponent {
  id: string;
  label: string;
  amount: number | string;
  isIncludedInBasePrice: boolean;
  displayOrder: number;
}

export interface PaymentPlan {
  id: string;
  name: string;
  type: string;
  bookingAmount: number | string;
  milestones: Record<string, unknown>[];
}

export interface BankPartner {
  id: string;
  bankName: string;
  logoUrl: string | null;
}

export interface ConstructionUpdate {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  updateDate: string;
  progressPercent: number | null;
}

export interface SpecificationItem {
  id: string;
  category: string;
  label: string;
  value: string;
}

export interface ProjectFaq {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface PublicBuilderDetail {
  id: string;
  companyName: string;
  slug: string;
  logo: string | null;
  city: string;
  reraNumber: string | null;
  yearsInBusiness: number | null;
  totalProjectsCompleted: number | null;
  onTimeDeliveryRate: number | null;
  verificationStatus: string;
  stats: { projectsCount: number; averageRating: number | null; reviewCount: number };
  reviews: BuilderReview[];
  portfolio: BuilderPortfolioProject[];
}

export interface BuilderPortfolioProject {
  id: string;
  title: string;
  city: string;
  completionYear: number | null;
  unitsCount: number | null;
  deliveredOnTime: boolean | null;
  coverImageUrl: string | null;
  description: string | null;
}

export interface BuilderReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  appliedFilters: Record<string, unknown>;
}

export interface PublicStats {
  projects: number;
  verifiedBuilders: number;
  cities: number;
  citiesWithCounts: {
    slug: string;
    name: string;
    count: number;
  }[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  stateName: string;
}

export interface Locality {
  id: string;
  cityId: string;
  name: string;
  slug: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface PublicBuilder {
  id: string;
  companyName: string;
  slug: string;
  logo: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SavedPropertyItem {
  projectId: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    city: { id: string; name: string };
    locality: { id: string; name: string };
    media: { url: string; isPrimary: boolean }[];
    unitTypes: { price: number }[];
  };
}

export interface SuggestProject {
  slug: string;
  title: string;
  city: string;
  locality: string;
  startingPrice: number | null;
}

export interface CompareProject {
  slug: string;
  title: string;
  primaryImageUrl: string | null;
  propertyTypes: string[];
  city: string;
  locality: string;
  possessionStatus: string;
  startingPrice: number;
  pricePerSqft: number | null;
  bookingAmount: number | null;
  paymentPlanType: string | null;
  unitTypesSummary: {
    label: string;
    price: number;
    availableCount: number;
    propertyType: string;
    bedrooms: number | null;
  }[];
  amenities: string[];
  reraStatus: string | null;
  occupancyCertStatus: string | null;
  commencementCertStatus: string | null;
  landTitleType: string | null;
  structureType: string | null;
  powerBackupCapacity: string | null;
  waterSource: string | null;
  liftBrand: string | null;
  liftCount: number | null;
  fireSafetyCompliant: boolean;
  openSpacePercent: number | null;
  greenAreaPercent: number | null;
  hasCctv: boolean;
  hasGatedEntry: boolean;
  petPolicy: string | null;
  nearestLandmarks: Record<
    string,
    { name: string; distanceKm: number } | undefined
  >;
  builder: {
    companyName: string;
    verificationStatus: string;
    yearsInBusiness: number | null;
    totalProjectsCompleted: number | null;
    onTimeDeliveryRate: number | null;
    averageReviewRating: number | null;
    reviewCount: number;
  };
}

export interface CompareResponse {
  data: CompareProject[];
  notFound: string[];
}
