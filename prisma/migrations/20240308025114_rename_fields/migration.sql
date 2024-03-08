/*
  Warnings:

  - You are about to drop the column `Lat` on the `LocationPoint` table. All the data in the column will be lost.
  - You are about to drop the column `Lon` on the `LocationPoint` table. All the data in the column will be lost.
  - Added the required column `lat` to the `LocationPoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `LocationPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocationPoint" DROP COLUMN "Lat",
DROP COLUMN "Lon",
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lon" DOUBLE PRECISION NOT NULL;
