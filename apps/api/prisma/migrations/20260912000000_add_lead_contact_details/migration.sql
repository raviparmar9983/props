-- Capture the contact details explicitly supplied with an enquiry. These stay
-- optional so existing authenticated customers and historical leads remain valid.
ALTER TABLE "Lead"
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "contactPhone" TEXT;
