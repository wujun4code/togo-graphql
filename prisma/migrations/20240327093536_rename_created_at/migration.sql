/*
  Warnings:

  - You are about to drop the column `postedAt` on the `PostComment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createdAt]` on the table `PostComment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostComment_postedAt_key";

-- AlterTable
ALTER TABLE "PostComment" DROP COLUMN "postedAt",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "PostComment_createdAt_key" ON "PostComment"("createdAt");
