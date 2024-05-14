/*
  Warnings:

  - Added the required column `postedAt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "followerID" INTEGER NOT NULL,
    "followeeID" INTEGER NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerID_followeeID_key" ON "Follow"("followerID", "followeeID");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerID_fkey" FOREIGN KEY ("followerID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followeeID_fkey" FOREIGN KEY ("followeeID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
