-- AlterTable
ALTER TABLE "specgate_specs"
ADD COLUMN IF NOT EXISTS "background" TEXT,
ADD COLUMN IF NOT EXISTS "currentBehavior" TEXT,
ADD COLUMN IF NOT EXISTS "desiredOutcome" TEXT,
ADD COLUMN IF NOT EXISTS "edgeCasesJson" JSONB,
ADD COLUMN IF NOT EXISTS "securityNotes" TEXT;
