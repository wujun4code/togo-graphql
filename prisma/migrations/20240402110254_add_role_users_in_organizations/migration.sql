/*
  Warnings:

  - Added the required column `organizationId` to the `OrganizationUserRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `OrganizationUserRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationUserRole" ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OrganizationUserRole" ADD CONSTRAINT "OrganizationUserRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUserRole" ADD CONSTRAINT "OrganizationUserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
