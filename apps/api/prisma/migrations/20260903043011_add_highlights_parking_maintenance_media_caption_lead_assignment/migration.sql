-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('COVERED', 'OPEN', 'STILT', 'BASEMENT');

-- CreateEnum
CREATE TYPE "MaintenanceFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'ONE_TIME');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "assignedContactId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "maintenanceAmount" DECIMAL(10,2),
ADD COLUMN     "maintenanceFrequency" "MaintenanceFrequency";

-- AlterTable
ALTER TABLE "ProjectMedia" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "UnitType" ADD COLUMN     "parkingCount" INTEGER,
ADD COLUMN     "parkingType" "ParkingType";

-- CreateTable
CREATE TABLE "ProjectHighlight" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectHighlight_projectId_idx" ON "ProjectHighlight"("projectId");

-- CreateIndex
CREATE INDEX "Lead_assignedContactId_idx" ON "Lead"("assignedContactId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedContactId_fkey" FOREIGN KEY ("assignedContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHighlight" ADD CONSTRAINT "ProjectHighlight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
