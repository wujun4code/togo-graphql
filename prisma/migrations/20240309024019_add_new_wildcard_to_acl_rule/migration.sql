/*
  Warnings:

  - Added the required column `wildcard` to the `ACLRule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ACLRule" DROP CONSTRAINT "ACLRule_userId_fkey";

-- DropIndex
DROP INDEX "unique_role_resource";

-- DropIndex
DROP INDEX "unique_user_resourceItem";

-- AlterTable
ALTER TABLE "ACLRule" ADD COLUMN     "wildcard" TEXT NOT NULL,
ALTER COLUMN "roleId" DROP NOT NULL,
ALTER COLUMN "resourceId" DROP NOT NULL,
ALTER COLUMN "resourceItemId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
