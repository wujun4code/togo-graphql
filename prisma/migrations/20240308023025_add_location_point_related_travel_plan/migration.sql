/*
  Warnings:

  - You are about to drop the column `destinationLat` on the `TravelPlan` table. All the data in the column will be lost.
  - You are about to drop the column `destinationLon` on the `TravelPlan` table. All the data in the column will be lost.
  - You are about to drop the column `originLat` on the `TravelPlan` table. All the data in the column will be lost.
  - You are about to drop the column `originLon` on the `TravelPlan` table. All the data in the column will be lost.
  - Added the required column `destinationId` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originId` to the `TravelPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelPlan" DROP COLUMN "destinationLat",
DROP COLUMN "destinationLon",
DROP COLUMN "originLat",
DROP COLUMN "originLon",
ADD COLUMN     "destinationId" INTEGER NOT NULL,
ADD COLUMN     "originId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "LocationPoint" (
    "id" SERIAL NOT NULL,
    "Lat" DOUBLE PRECISION NOT NULL,
    "Lon" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LocationPoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelPlan" ADD CONSTRAINT "TravelPlan_originId_fkey" FOREIGN KEY ("originId") REFERENCES "LocationPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan" ADD CONSTRAINT "TravelPlan_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "LocationPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
