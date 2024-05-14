-- CreateTable
CREATE TABLE "MentionedHistory" (
    "id" SERIAL NOT NULL,
    "relatedPostId" INTEGER,
    "relatedCommentId" INTEGER,
    "mentionedUserId" INTEGER NOT NULL,
    "mentionerUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentionedHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentionedHistory_createdAt_key" ON "MentionedHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MentionedHistory_updatedAt_key" ON "MentionedHistory"("updatedAt");

-- AddForeignKey
ALTER TABLE "MentionedHistory" ADD CONSTRAINT "MentionedHistory_relatedPostId_fkey" FOREIGN KEY ("relatedPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedHistory" ADD CONSTRAINT "MentionedHistory_relatedCommentId_fkey" FOREIGN KEY ("relatedCommentId") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedHistory" ADD CONSTRAINT "MentionedHistory_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedHistory" ADD CONSTRAINT "MentionedHistory_mentionerUserId_fkey" FOREIGN KEY ("mentionerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
