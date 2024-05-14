-- CreateIndex
CREATE INDEX "MentionedHistory_createdAt_idx" ON "MentionedHistory"("createdAt");

-- CreateIndex
CREATE INDEX "MentionedHistory_updatedAt_idx" ON "MentionedHistory"("updatedAt");

-- CreateIndex
CREATE INDEX "Organization_createdAt_idx" ON "Organization"("createdAt");

-- CreateIndex
CREATE INDEX "Organization_updatedAt_idx" ON "Organization"("updatedAt");

-- CreateIndex
CREATE INDEX "OrganizationUserRole_createdAt_idx" ON "OrganizationUserRole"("createdAt");

-- CreateIndex
CREATE INDEX "OrganizationUserRole_updatedAt_idx" ON "OrganizationUserRole"("updatedAt");

-- CreateIndex
CREATE INDEX "Post_postedAt_idx" ON "Post"("postedAt");

-- CreateIndex
CREATE INDEX "Post_updatedAt_idx" ON "Post"("updatedAt");

-- CreateIndex
CREATE INDEX "PostComment_createdAt_idx" ON "PostComment"("createdAt");

-- CreateIndex
CREATE INDEX "PostComment_updatedAt_idx" ON "PostComment"("updatedAt");

-- CreateIndex
CREATE INDEX "Robot_createdAt_idx" ON "Robot"("createdAt");

-- CreateIndex
CREATE INDEX "Robot_updatedAt_idx" ON "Robot"("updatedAt");

-- CreateIndex
CREATE INDEX "RobotHookHeader_createdAt_idx" ON "RobotHookHeader"("createdAt");

-- CreateIndex
CREATE INDEX "RobotHookHeader_updatedAt_idx" ON "RobotHookHeader"("updatedAt");

-- CreateIndex
CREATE INDEX "RoleUser_createdAt_idx" ON "RoleUser"("createdAt");

-- CreateIndex
CREATE INDEX "RoleUser_updatedAt_idx" ON "RoleUser"("updatedAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");

-- CreateIndex
CREATE INDEX "User_OAuth2_createdAt_idx" ON "User_OAuth2"("createdAt");

-- CreateIndex
CREATE INDEX "User_OAuth2_updatedAt_idx" ON "User_OAuth2"("updatedAt");
