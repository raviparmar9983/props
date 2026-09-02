-- CreateEnum
CREATE TYPE "ProjectVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "verificationStatus" "ProjectVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UnitType" ADD COLUMN "bedrooms" INTEGER;

-- CreateIndex
CREATE INDEX "Project_verificationStatus_status_idx" ON "Project"("verificationStatus", "status");
