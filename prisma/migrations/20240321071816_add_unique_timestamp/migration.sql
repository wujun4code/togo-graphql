/*
  Warnings:

  - A unique constraint covering the columns `[postedAt]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `RoleUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt]` on the table `RoleUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `User_OAuth2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt]` on the table `User_OAuth2` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RoleUser" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Post_postedAt_key" ON "Post"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_updatedAt_key" ON "Post"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoleUser_createdAt_key" ON "RoleUser"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoleUser_updatedAt_key" ON "RoleUser"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_createdAt_key" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_updatedAt_key" ON "User"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_OAuth2_createdAt_key" ON "User_OAuth2"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_OAuth2_updatedAt_key" ON "User_OAuth2"("updatedAt");
