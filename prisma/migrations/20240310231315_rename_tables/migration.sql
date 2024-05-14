/*
  Warnings:

  - You are about to drop the `TravelPlanRoleACLRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TravelPlanUserACLRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TravelPlanRoleACLRule" DROP CONSTRAINT "TravelPlanRoleACLRule_roleId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlanRoleACLRule" DROP CONSTRAINT "TravelPlanRoleACLRule_travelPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlanUserACLRule" DROP CONSTRAINT "TravelPlanUserACLRule_travelPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlanUserACLRule" DROP CONSTRAINT "TravelPlanUserACLRule_userId_fkey";

-- DropTable
DROP TABLE "TravelPlanRoleACLRule";

-- DropTable
DROP TABLE "TravelPlanUserACLRule";

-- CreateTable
CREATE TABLE "TravelPlan_UserACLRule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER NOT NULL,

    CONSTRAINT "TravelPlan_UserACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelPlan_RoleACLRule" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER NOT NULL,

    CONSTRAINT "TravelPlan_RoleACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlan_UserACLRule_userId_travelPlanId_key" ON "TravelPlan_UserACLRule"("userId", "travelPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlan_RoleACLRule_roleId_travelPlanId_key" ON "TravelPlan_RoleACLRule"("roleId", "travelPlanId");

-- AddForeignKey
ALTER TABLE "TravelPlan_UserACLRule" ADD CONSTRAINT "TravelPlan_UserACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan_UserACLRule" ADD CONSTRAINT "TravelPlan_UserACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan_RoleACLRule" ADD CONSTRAINT "TravelPlan_RoleACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan_RoleACLRule" ADD CONSTRAINT "TravelPlan_RoleACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
