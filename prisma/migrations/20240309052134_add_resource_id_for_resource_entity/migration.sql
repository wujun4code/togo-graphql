/*
  Warnings:

  - Added the required column `resourceId` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelPlan" ADD COLUMN     "resourceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TravelPlan" ADD CONSTRAINT "TravelPlan_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
