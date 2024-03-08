/*
  Warnings:

  - A unique constraint covering the columns `[lat,lon]` on the table `LocationPoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LocationPoint_lat_lon_key" ON "LocationPoint"("lat", "lon");
