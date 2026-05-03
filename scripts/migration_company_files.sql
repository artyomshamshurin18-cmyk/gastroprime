-- Migration: add_company_files_account_number
-- Run this on the production database

-- 1. Add accountNumber to Company (with backfill)
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
UPDATE "Company" SET "accountNumber" = CONCAT('GP-', UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 7))) WHERE "accountNumber" IS NULL;
ALTER TABLE "Company" ALTER COLUMN "accountNumber" SET NOT NULL;
ALTER TABLE "Company" ADD CONSTRAINT IF NOT EXISTS "Company_accountNumber_key" UNIQUE ("accountNumber");

-- 2. Create CompanyFile table
CREATE TABLE IF NOT EXISTS "CompanyFile" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'DOCUMENT',
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CompanyFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CompanyFile_companyId_idx" ON "CompanyFile"("companyId");

ALTER TABLE "CompanyFile" ADD CONSTRAINT IF NOT EXISTS "CompanyFile_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE;
