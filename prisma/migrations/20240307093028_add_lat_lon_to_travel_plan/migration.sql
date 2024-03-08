/*
  Warnings:

  - A unique constraint covering the columns `[sub]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `destinationLat` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationLon` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originLat` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originLon` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelPlan" ADD COLUMN     "destinationLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "destinationLon" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originLon" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sub" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_sub_key" ON "User"("sub");
