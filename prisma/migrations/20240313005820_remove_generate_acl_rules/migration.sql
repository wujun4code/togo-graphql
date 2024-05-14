/*
  Warnings:

  - You are about to drop the `TravelPlanACLRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TravelPlanACLRule" DROP CONSTRAINT "TravelPlanACLRule_roleId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlanACLRule" DROP CONSTRAINT "TravelPlanACLRule_travelPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlanACLRule" DROP CONSTRAINT "TravelPlanACLRule_userId_fkey";

-- DropTable
DROP TABLE "TravelPlanACLRule";
