/*
  Warnings:

  - You are about to drop the column `managedOrganizationId` on the `Robot` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Robot" DROP CONSTRAINT "Robot_managedOrganizationId_fkey";

-- AlterTable
ALTER TABLE "Robot" DROP COLUMN "managedOrganizationId",
ADD COLUMN     "managingOrganizationId" INTEGER,
ADD COLUMN     "managingUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Robot" ADD CONSTRAINT "Robot_managingOrganizationId_fkey" FOREIGN KEY ("managingOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Robot" ADD CONSTRAINT "Robot_managingUserId_fkey" FOREIGN KEY ("managingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
