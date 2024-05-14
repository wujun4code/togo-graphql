-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "replyToId" INTEGER;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
