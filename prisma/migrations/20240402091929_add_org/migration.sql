-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('HUMAN', 'ORG', 'BOT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'HUMAN';

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "relatedUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_relatedUserId_key" ON "Organization"("relatedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_createdAt_key" ON "Organization"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_updatedAt_key" ON "Organization"("updatedAt");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
