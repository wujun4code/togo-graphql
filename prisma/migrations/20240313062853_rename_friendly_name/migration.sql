/*
  Warnings:

  - You are about to drop the column `friendly_name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "friendly_name",
ADD COLUMN     "friendlyName" TEXT;
