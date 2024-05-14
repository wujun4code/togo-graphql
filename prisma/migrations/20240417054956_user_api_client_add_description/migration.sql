/*
  Warnings:

  - Added the required column `name` to the `UserAPIClient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAPIClient" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
