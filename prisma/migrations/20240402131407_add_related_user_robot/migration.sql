/*
  Warnings:

  - A unique constraint covering the columns `[relatedUserId]` on the table `Robot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `relatedUserId` to the `Robot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Robot" ADD COLUMN     "relatedUserId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Robot_relatedUserId_key" ON "Robot"("relatedUserId");

-- AddForeignKey
ALTER TABLE "Robot" ADD CONSTRAINT "Robot_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
