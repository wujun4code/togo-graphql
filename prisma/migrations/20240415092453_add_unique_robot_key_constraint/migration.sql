/*
  Warnings:

  - A unique constraint covering the columns `[robotId,key]` on the table `RobotHookHeader` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RobotHookHeader_robotId_key_key" ON "RobotHookHeader"("robotId", "key");
