-- CreateEnum
CREATE TYPE "ProjectReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "reviewStatus" "ProjectReviewStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Project" ADD COLUMN "reviewNotes" TEXT;

-- CreateTable
CREATE TABLE "ProjectReviewLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "action" "ProjectReviewStatus" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "reviewedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectReviewLog_projectId_createdAt_idx" ON "ProjectReviewLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_reviewStatus_status_idx" ON "Project"("reviewStatus", "status");

-- AddForeignKey
ALTER TABLE "ProjectReviewLog" ADD CONSTRAINT "ProjectReviewLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
