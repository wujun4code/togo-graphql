-- AlterTable
ALTER TABLE "UserAPIClient" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "UserAPIClient_createdAt_idx" ON "UserAPIClient"("createdAt");

-- CreateIndex
CREATE INDEX "UserAPIClient_updatedAt_idx" ON "UserAPIClient"("updatedAt");
