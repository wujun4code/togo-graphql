-- CreateTable
CREATE TABLE "UnreadPostCommentNotification" (
    "id" SERIAL NOT NULL,
    "relatedCommentId" INTEGER NOT NULL,
    "originalPosterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnreadPostCommentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentNotificationMarkedReadArchived" (
    "id" SERIAL NOT NULL,
    "originalNotificationId" INTEGER NOT NULL,
    "originalPosterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentNotificationMarkedReadArchived_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnreadPostCommentNotification_relatedCommentId_key" ON "UnreadPostCommentNotification"("relatedCommentId");

-- CreateIndex
CREATE INDEX "UnreadPostCommentNotification_createdAt_idx" ON "UnreadPostCommentNotification"("createdAt");

-- CreateIndex
CREATE INDEX "UnreadPostCommentNotification_updatedAt_idx" ON "UnreadPostCommentNotification"("updatedAt");

-- CreateIndex
CREATE INDEX "UnreadPostCommentNotification_originalPosterId_idx" ON "UnreadPostCommentNotification"("originalPosterId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentNotificationMarkedReadArchived_originalNotificationI_key" ON "CommentNotificationMarkedReadArchived"("originalNotificationId");

-- CreateIndex
CREATE INDEX "CommentNotificationMarkedReadArchived_createdAt_idx" ON "CommentNotificationMarkedReadArchived"("createdAt");

-- CreateIndex
CREATE INDEX "CommentNotificationMarkedReadArchived_updatedAt_idx" ON "CommentNotificationMarkedReadArchived"("updatedAt");

-- CreateIndex
CREATE INDEX "CommentNotificationMarkedReadArchived_originalPosterId_idx" ON "CommentNotificationMarkedReadArchived"("originalPosterId");

-- AddForeignKey
ALTER TABLE "UnreadPostCommentNotification" ADD CONSTRAINT "UnreadPostCommentNotification_relatedCommentId_fkey" FOREIGN KEY ("relatedCommentId") REFERENCES "PostComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnreadPostCommentNotification" ADD CONSTRAINT "UnreadPostCommentNotification_originalPosterId_fkey" FOREIGN KEY ("originalPosterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentNotificationMarkedReadArchived" ADD CONSTRAINT "CommentNotificationMarkedReadArchived_originalNotification_fkey" FOREIGN KEY ("originalNotificationId") REFERENCES "UnreadPostCommentNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentNotificationMarkedReadArchived" ADD CONSTRAINT "CommentNotificationMarkedReadArchived_originalPosterId_fkey" FOREIGN KEY ("originalPosterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
