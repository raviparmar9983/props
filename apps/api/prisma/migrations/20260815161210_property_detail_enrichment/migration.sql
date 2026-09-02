-- CreateEnum
CREATE TYPE "ReraStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'RECEIVED');

-- CreateEnum
CREATE TYPE "LandTitleType" AS ENUM ('FREEHOLD', 'LEASEHOLD');

-- CreateEnum
CREATE TYPE "LitigationStatus" AS ENUM ('NONE', 'PENDING');

-- CreateEnum
CREATE TYPE "LandmarkCategory" AS ENUM ('SCHOOL', 'HOSPITAL', 'METRO', 'RAILWAY', 'AIRPORT', 'HIGHWAY', 'MALL', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecCategory" AS ENUM ('FLOORING', 'KITCHEN', 'BATHROOM', 'DOORS_WINDOWS', 'ELECTRICAL', 'PAINT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentPlanType" AS ENUM ('CONSTRUCTION_LINKED', 'POSSESSION_LINKED', 'FLEXI');

-- CreateEnum
CREATE TYPE "Facing" AS ENUM ('NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST');

-- CreateEnum
CREATE TYPE "SiteVisitStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BuilderProfile" ADD COLUMN     "onTimeDeliveryRate" DOUBLE PRECISION,
ADD COLUMN     "totalProjectsCompleted" INTEGER,
ADD COLUMN     "yearsInBusiness" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "allowsSiteVisitBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "commencementCertStatus" "CertificateStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "fireSafetyCompliant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "greenAreaPercent" DOUBLE PRECISION,
ADD COLUMN     "hasCctv" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGatedEntry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landTitleType" "LandTitleType",
ADD COLUMN     "liftBrand" TEXT,
ADD COLUMN     "liftCount" INTEGER,
ADD COLUMN     "litigationDetails" TEXT,
ADD COLUMN     "litigationStatus" "LitigationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "neighborhoodOverview" TEXT,
ADD COLUMN     "occupancyCertStatus" "CertificateStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "openSpacePercent" DOUBLE PRECISION,
ADD COLUMN     "petPolicy" TEXT,
ADD COLUMN     "powerBackupCapacity" TEXT,
ADD COLUMN     "reraPortalUrl" TEXT,
ADD COLUMN     "reraStatus" "ReraStatus",
ADD COLUMN     "securityGuardCount" INTEGER,
ADD COLUMN     "structureType" TEXT,
ADD COLUMN     "videoWalkthroughUrl" TEXT,
ADD COLUMN     "virtualTour3dUrl" TEXT,
ADD COLUMN     "waterSource" TEXT;

-- AlterTable
ALTER TABLE "ProjectMedia" ADD COLUMN     "unitTypeId" TEXT;

-- AlterTable
ALTER TABLE "UnitType" ADD COLUMN     "bookingAmount" DECIMAL(12,2),
ADD COLUMN     "facing" "Facing",
ADD COLUMN     "floorNumber" INTEGER,
ADD COLUMN     "viewType" TEXT;

-- CreateTable
CREATE TABLE "NearbyLandmark" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "LandmarkCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "travelTimeMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NearbyLandmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceComponent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isIncludedInBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentPlanType" NOT NULL,
    "bookingAmount" DECIMAL(12,2) NOT NULL,
    "milestones" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankPartner" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "updateDate" DATE NOT NULL,
    "progressPercent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "SpecCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecificationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuilderPortfolioProject" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "completionYear" INTEGER,
    "unitsCount" INTEGER,
    "deliveredOnTime" BOOLEAN,
    "coverImageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuilderPortfolioProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuilderReview" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "customerId" TEXT,
    "reviewerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuilderReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteVisitBooking" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "preferredDate" DATE NOT NULL,
    "preferredSlot" TEXT,
    "status" "SiteVisitStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteVisitBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFAQ" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NearbyLandmark_projectId_idx" ON "NearbyLandmark"("projectId");

-- CreateIndex
CREATE INDEX "PriceComponent_projectId_idx" ON "PriceComponent"("projectId");

-- CreateIndex
CREATE INDEX "PaymentPlan_projectId_idx" ON "PaymentPlan"("projectId");

-- CreateIndex
CREATE INDEX "BankPartner_projectId_idx" ON "BankPartner"("projectId");

-- CreateIndex
CREATE INDEX "ConstructionUpdate_projectId_updateDate_idx" ON "ConstructionUpdate"("projectId", "updateDate");

-- CreateIndex
CREATE INDEX "SpecificationItem_projectId_category_idx" ON "SpecificationItem"("projectId", "category");

-- CreateIndex
CREATE INDEX "BuilderPortfolioProject_builderId_idx" ON "BuilderPortfolioProject"("builderId");

-- CreateIndex
CREATE INDEX "BuilderReview_builderId_idx" ON "BuilderReview"("builderId");

-- CreateIndex
CREATE INDEX "SiteVisitBooking_projectId_status_idx" ON "SiteVisitBooking"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectFAQ_projectId_idx" ON "ProjectFAQ"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_unitTypeId_idx" ON "ProjectMedia"("projectId", "unitTypeId");

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "UnitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyLandmark" ADD CONSTRAINT "NearbyLandmark_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceComponent" ADD CONSTRAINT "PriceComponent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankPartner" ADD CONSTRAINT "BankPartner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionUpdate" ADD CONSTRAINT "ConstructionUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationItem" ADD CONSTRAINT "SpecificationItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderPortfolioProject" ADD CONSTRAINT "BuilderPortfolioProject_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderReview" ADD CONSTRAINT "BuilderReview_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "BuilderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderReview" ADD CONSTRAINT "BuilderReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVisitBooking" ADD CONSTRAINT "SiteVisitBooking_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVisitBooking" ADD CONSTRAINT "SiteVisitBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFAQ" ADD CONSTRAINT "ProjectFAQ_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
