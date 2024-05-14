-- CreateTable
CREATE TABLE "UnreadMentionedNotification" (
    "id" SERIAL NOT NULL,
    "relatedHistoryId" INTEGER NOT NULL,
    "mentionedUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnreadMentionedNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentionedNotificationMarkedReadArchived" (
    "id" SERIAL NOT NULL,
    "originalNotificationId" INTEGER NOT NULL,
    "mentionedUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentionedNotificationMarkedReadArchived_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnreadMentionedNotification_relatedHistoryId_key" ON "UnreadMentionedNotification"("relatedHistoryId");

-- CreateIndex
CREATE INDEX "UnreadMentionedNotification_createdAt_idx" ON "UnreadMentionedNotification"("createdAt");

-- CreateIndex
CREATE INDEX "UnreadMentionedNotification_updatedAt_idx" ON "UnreadMentionedNotification"("updatedAt");

-- CreateIndex
CREATE INDEX "UnreadMentionedNotification_mentionedUserId_idx" ON "UnreadMentionedNotification"("mentionedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MentionedNotificationMarkedReadArchived_originalNotificatio_key" ON "MentionedNotificationMarkedReadArchived"("originalNotificationId");

-- CreateIndex
CREATE INDEX "MentionedNotificationMarkedReadArchived_createdAt_idx" ON "MentionedNotificationMarkedReadArchived"("createdAt");

-- CreateIndex
CREATE INDEX "MentionedNotificationMarkedReadArchived_updatedAt_idx" ON "MentionedNotificationMarkedReadArchived"("updatedAt");

-- CreateIndex
CREATE INDEX "MentionedNotificationMarkedReadArchived_mentionedUserId_idx" ON "MentionedNotificationMarkedReadArchived"("mentionedUserId");

-- AddForeignKey
ALTER TABLE "UnreadMentionedNotification" ADD CONSTRAINT "UnreadMentionedNotification_relatedHistoryId_fkey" FOREIGN KEY ("relatedHistoryId") REFERENCES "MentionedHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnreadMentionedNotification" ADD CONSTRAINT "UnreadMentionedNotification_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedNotificationMarkedReadArchived" ADD CONSTRAINT "MentionedNotificationMarkedReadArchived_originalNotificati_fkey" FOREIGN KEY ("originalNotificationId") REFERENCES "UnreadMentionedNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedNotificationMarkedReadArchived" ADD CONSTRAINT "MentionedNotificationMarkedReadArchived_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
