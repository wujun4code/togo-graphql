/*
  Warnings:

  - Added the required column `resourceItemId` to the `ACLRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ACLRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ACLRule" ADD COLUMN     "resourceItemId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "unique_user_resourceItem" ON "ACLRule"("userId", "resourceItemId");

-- CreateIndex
CREATE INDEX "unique_role_resource" ON "ACLRule"("roleId", "resourceId");

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
