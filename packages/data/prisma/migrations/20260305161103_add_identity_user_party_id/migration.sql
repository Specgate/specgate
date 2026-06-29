-- AlterTable
ALTER TABLE "identity"."User" ADD COLUMN     "partyId" TEXT;

-- CreateIndex
CREATE INDEX "User_partyId_idx" ON "identity"."User"("partyId");
