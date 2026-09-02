-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'EMAIL_VERIFICATION';

-- AlterTable
ALTER TABLE "Amenity" ADD COLUMN     "description" TEXT;
