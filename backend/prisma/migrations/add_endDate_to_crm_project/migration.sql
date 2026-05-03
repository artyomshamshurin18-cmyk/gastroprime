-- Add endDate field to CrmProject
ALTER TABLE "CrmProject" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
