/*
  Warnings:

  - You are about to drop the column `resourceId` on the `TravelPlan` table. All the data in the column will be lost.
  - You are about to drop the `ACLRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_userId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlan" DROP CONSTRAINT "TravelPlan_resourceId_fkey";

-- AlterTable
ALTER TABLE "TravelPlan" DROP COLUMN "resourceId";

-- DropTable
DROP TABLE "ACLRule";

-- DropTable
DROP TABLE "Resource";
