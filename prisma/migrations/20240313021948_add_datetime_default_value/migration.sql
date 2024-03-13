/*
  Warnings:

  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "postedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "postedAt" SET DATA TYPE TIMESTAMPTZ(3);
