import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "BUILDER", "CUSTOMER"]);
export const UserStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);
export const BuilderVerificationStatusSchema = z.enum([
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);
export const ProjectStatusSchema = z.enum([
  "DRAFT",
  "UPCOMING",
  "UNDER_CONSTRUCTION",
  "READY",
  "ARCHIVED",
]);
export const ProjectReviewStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
]);
export const PropertyTypeSchema = z.enum([
  "FLAT",
  "HOUSE",
  "PLOT",
  "TENEMENT",
  "SHOP",
  "CORPORATE",
]);
export const AreaUnitSchema = z.enum(["SQFT", "SQM"]);
export const PriceUnitSchema = z.enum(["LAKH", "CRORE", "TOTAL"]);
export const MediaTypeSchema = z.enum([
  "IMAGE",
  "VIDEO",
  "FLOOR_PLAN",
  "BROCHURE",
  "MASTER_PLAN",
]);
export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
]);
export const ReraStatusSchema = z.enum([
  "REGISTERED",
  "PENDING",
  "NOT_APPLICABLE",
]);
export const CertificateStatusSchema = z.enum([
  "OBTAINED",
  "APPLIED",
  "PENDING",
  "NOT_APPLICABLE",
]);
export const LandTitleTypeSchema = z.enum([
  "CLEAR_FREEHOLD",
  "LEASEHOLD",
  "CO_OPERATIVE",
  "UNAVAILABLE",
]);
export const LitigationStatusSchema = z.enum(["NONE", "ONGOING", "PENDING"]);
export const LandmarkCategorySchema = z.enum([
  "SCHOOL",
  "HOSPITAL",
  "TRANSIT",
  "MALL",
  "PARK",
  "BANK",
  "MARKET",
  "OTHER",
]);
export const SpecCategorySchema = z.enum([
  "STRUCTURE",
  "FLOORING",
  "KITCHEN",
  "BATHROOM",
  "DOORS_WINDOWS",
  "ELECTRICAL",
  "PLUMBING",
  "SECURITY",
  "OTHER",
]);
export const PaymentPlanTypeSchema = z.enum([
  "CONSTRUCTION_LINKED",
  "FIXED_TIME",
  "SUBVENTION",
  "PROGRESS",
]);
export const FacingSchema = z.enum([
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
]);
export const SiteVisitStatusSchema = z.enum([
  "REQUESTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const PaginatedMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: UserRoleSchema,
    verificationStatus: BuilderVerificationStatusSchema.optional(),
  }),
});

export const BuilderProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  slug: z.string(),
    reraNumber: z.string().nullable().optional(),
    gstNumber: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
  cityId: z.string(),
  phone: z.string().nullable().optional(),
  verificationStatus: BuilderVerificationStatusSchema,
  rejectionReason: z.string().nullable().optional(),
  yearsInBusiness: z.number().nullable().optional(),
  totalProjectsCompleted: z.number().nullable().optional(),
  onTimeDeliveryRate: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  city: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
});

export const CitySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  stateName: z.string(),
});

export const LocalitySchema = z.object({
  id: z.string(),
  cityId: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const ProjectSummarySchema = z.object({
  id: z.string(),
  builderId: z.string(),
  cityId: z.string(),
  localityId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  status: ProjectStatusSchema,
  reviewStatus: ProjectReviewStatusSchema.optional(),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  reraProjectNumber: z.string().nullable().optional(),
  possessionDate: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  city: z.object({ id: z.string(), name: z.string() }).optional(),
  locality: z.object({ id: z.string(), name: z.string() }).optional(),
  media: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        type: MediaTypeSchema,
        isPrimary: z.boolean(),
        displayOrder: z.number(),
      }),
    )
    .optional(),
  _count: z
    .object({
      unitTypes: z.number().optional(),
      media: z.number().optional(),
      leads: z.number().optional(),
    })
    .optional(),
});

export const NearbyLandmarkSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  category: LandmarkCategorySchema,
  name: z.string(),
  distanceKm: z.number(),
  travelTimeMinutes: z.number().nullable().optional(),
  createdAt: z.string(),
});

export const PriceComponentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  label: z.string(),
  amount: z.number(),
  isIncludedInBasePrice: z.boolean(),
  displayOrder: z.number().nullable().optional(),
  createdAt: z.string(),
});

export const PaymentPlanSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  type: PaymentPlanTypeSchema,
  bookingAmount: z.number(),
  milestones: z.any(),
  createdAt: z.string(),
});

export const BankPartnerSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  bankName: z.string(),
  logoUrl: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ConstructionUpdateSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  updateDate: z.string(),
  progressPercent: z.number().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SpecificationItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  category: SpecCategorySchema,
  label: z.string(),
  value: z.string(),
  createdAt: z.string(),
});

export const ProjectFAQSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  question: z.string(),
  answer: z.string(),
  displayOrder: z.number().nullable().optional(),
  createdAt: z.string(),
});

export const SiteVisitBookingSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  preferredDate: z.string(),
  preferredSlot: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: SiteVisitStatusSchema,
  createdAt: z.string(),
  project: z
    .object({ id: z.string(), title: z.string(), slug: z.string() })
    .optional(),
});

export const BuilderPortfolioProjectSchema = z.object({
  id: z.string(),
  builderId: z.string(),
  title: z.string(),
  city: z.string(),
  completionYear: z.number().nullable().optional(),
  unitsCount: z.number().nullable().optional(),
  deliveredOnTime: z.boolean(),
  coverImageUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const BuilderReviewSchema = z.object({
  id: z.string(),
  builderId: z.string(),
  customerId: z.string().nullable().optional(),
  reviewerName: z.string(),
  rating: z.number(),
  comment: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ProjectDetailSchema = ProjectSummarySchema.extend({
  towers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        totalFloors: z.number().nullable().optional(),
      }),
    )
    .optional(),
  unitTypes: z
    .array(
      z.object({
        id: z.string(),
        propertyType: PropertyTypeSchema,
        label: z.string(),
        towerId: z.string().nullable().optional(),
        carpetArea: z.number().nullable().optional(),
        builtUpArea: z.number().nullable().optional(),
        areaUnit: AreaUnitSchema,
        price: z.number(),
        priceUnit: PriceUnitSchema,
        totalCount: z.number(),
        availableCount: z.number(),
        floorNumber: z.number().nullable().optional(),
        facing: FacingSchema.nullable().optional(),
        viewType: z.string().nullable().optional(),
        bookingAmount: z.number().nullable().optional(),
        attributes: z.any().nullable().optional(),
      }),
    )
    .optional(),
  amenities: z
    .array(
      z.object({
        amenity: z.object({
          id: z.number(),
          name: z.string(),
          icon: z.string().nullable().optional(),
        }),
      }),
    )
    .optional(),
  contacts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
        email: z.string().nullable().optional(),
        designation: z.string().nullable().optional(),
        isPrimary: z.boolean(),
      }),
    )
    .optional(),
  reraStatus: ReraStatusSchema.nullable().optional(),
  reraPortalUrl: z.string().nullable().optional(),
  occupancyCertStatus: CertificateStatusSchema.nullable().optional(),
  commencementCertStatus: CertificateStatusSchema.nullable().optional(),
  landTitleType: LandTitleTypeSchema.nullable().optional(),
  litigationStatus: LitigationStatusSchema.nullable().optional(),
  litigationDetails: z.string().nullable().optional(),
  structureType: z.string().nullable().optional(),
  powerBackupCapacity: z.string().nullable().optional(),
  waterSource: z.string().nullable().optional(),
  liftBrand: z.string().nullable().optional(),
  liftCount: z.number().nullable().optional(),
  fireSafetyCompliant: z.boolean().nullable().optional(),
  openSpacePercent: z.number().nullable().optional(),
  greenAreaPercent: z.number().nullable().optional(),
  hasCctv: z.boolean().nullable().optional(),
  hasGatedEntry: z.boolean().nullable().optional(),
  securityGuardCount: z.number().nullable().optional(),
  petPolicy: z.string().nullable().optional(),
  neighborhoodOverview: z.string().nullable().optional(),
  videoWalkthroughUrl: z.string().nullable().optional(),
  virtualTour3dUrl: z.string().nullable().optional(),
  allowsSiteVisitBooking: z.boolean().nullable().optional(),
  landmarks: z.array(NearbyLandmarkSchema).optional(),
  priceComponents: z.array(PriceComponentSchema).optional(),
  paymentPlans: z.array(PaymentPlanSchema).optional(),
  bankPartners: z.array(BankPartnerSchema).optional(),
  constructionUpdates: z.array(ConstructionUpdateSchema).optional(),
  specifications: z.array(SpecificationItemSchema).optional(),
  faqs: z.array(ProjectFAQSchema).optional(),
  siteVisits: z.array(SiteVisitBookingSchema).optional(),
});

export const TowerSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  totalFloors: z.number().nullable().optional(),
  createdAt: z.string(),
});

export const UnitTypeSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  towerId: z.string().nullable().optional(),
  propertyType: PropertyTypeSchema,
  label: z.string(),
  carpetArea: z.number().nullable().optional(),
  builtUpArea: z.number().nullable().optional(),
  areaUnit: AreaUnitSchema,
  price: z.number(),
  priceUnit: PriceUnitSchema,
  totalCount: z.number(),
  availableCount: z.number(),
  floorNumber: z.number().nullable().optional(),
  facing: FacingSchema.nullable().optional(),
  viewType: z.string().nullable().optional(),
  bookingAmount: z.number().nullable().optional(),
  attributes: z.any().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProjectMediaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: MediaTypeSchema,
  url: z.string(),
  displayOrder: z.number(),
  isPrimary: z.boolean(),
  unitTypeId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ContactSchema = z.object({
  id: z.string(),
  builderId: z.string(),
  projectId: z.string().nullable().optional(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
});

export const LeadSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  unitTypeId: z.string().nullable().optional(),
  builderId: z.string(),
  customerId: z.string(),
  message: z.string().nullable().optional(),
  status: LeadStatusSchema,
  contactedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  project: z.object({ id: z.string(), title: z.string() }).optional(),
  unitType: z
    .object({ id: z.string(), label: z.string(), price: z.number() })
    .optional(),
  customer: z
    .object({
      id: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  duplicate: z.boolean().optional(),
});

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable().optional(),
  isRead: z.boolean(),
  relatedEntityType: z.string().nullable().optional(),
  relatedEntityId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const AmenitySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string().nullable().optional(),
});

export const RegistrationResultSchema = z.object({
  userId: z.string(),
  builderId: z.string(),
  verificationStatus: BuilderVerificationStatusSchema,
  message: z.string(),
});

export const OtpRequestResultSchema = z.object({
  message: z.string(),
  expiresInSeconds: z.number(),
  resendInSeconds: z.number().optional(),
});

export const RequiresEmailVerificationSchema = z.object({
  requiresEmailVerification: z.literal(true),
  email: z.string(),
  expiresInSeconds: z.number(),
  resendInSeconds: z.number(),
  message: z.string().optional(),
});

export const EmailVerifiedResultSchema = AuthTokensSchema.extend({
  message: z.string(),
});

export const RefreshResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type BuilderVerificationStatus = z.infer<
  typeof BuilderVerificationStatusSchema
>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type ProjectReviewStatus = z.infer<typeof ProjectReviewStatusSchema>;
export type PropertyType = z.infer<typeof PropertyTypeSchema>;
export type AreaUnit = z.infer<typeof AreaUnitSchema>;
export type PriceUnit = z.infer<typeof PriceUnitSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type RequiresEmailVerification = z.infer<
  typeof RequiresEmailVerificationSchema
>;
export type EmailVerifiedResult = z.infer<typeof EmailVerifiedResultSchema>;
export type LoginResult = AuthTokens | RequiresEmailVerification;
export type BuilderProfile = z.infer<typeof BuilderProfileSchema>;
export type City = z.infer<typeof CitySchema>;
export type Locality = z.infer<typeof LocalitySchema>;
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
export type Tower = z.infer<typeof TowerSchema>;
export type UnitType = z.infer<typeof UnitTypeSchema>;
export type ProjectMedia = z.infer<typeof ProjectMediaSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;
export type ReraStatus = z.infer<typeof ReraStatusSchema>;
export type CertificateStatus = z.infer<typeof CertificateStatusSchema>;
export type LandTitleType = z.infer<typeof LandTitleTypeSchema>;
export type LitigationStatus = z.infer<typeof LitigationStatusSchema>;
export type LandmarkCategory = z.infer<typeof LandmarkCategorySchema>;
export type SpecCategory = z.infer<typeof SpecCategorySchema>;
export type PaymentPlanType = z.infer<typeof PaymentPlanTypeSchema>;
export type Facing = z.infer<typeof FacingSchema>;
export type SiteVisitStatus = z.infer<typeof SiteVisitStatusSchema>;
export type NearbyLandmark = z.infer<typeof NearbyLandmarkSchema>;
export type PriceComponent = z.infer<typeof PriceComponentSchema>;
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
export type BankPartner = z.infer<typeof BankPartnerSchema>;
export type ConstructionUpdate = z.infer<typeof ConstructionUpdateSchema>;
export type SpecificationItem = z.infer<typeof SpecificationItemSchema>;
export type ProjectFAQ = z.infer<typeof ProjectFAQSchema>;
export type SiteVisitBooking = z.infer<typeof SiteVisitBookingSchema>;
export type BuilderPortfolioProject = z.infer<
  typeof BuilderPortfolioProjectSchema
>;
export type BuilderReview = z.infer<typeof BuilderReviewSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
