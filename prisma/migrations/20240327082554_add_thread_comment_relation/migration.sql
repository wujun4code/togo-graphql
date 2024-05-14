-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "threadId" INTEGER;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
