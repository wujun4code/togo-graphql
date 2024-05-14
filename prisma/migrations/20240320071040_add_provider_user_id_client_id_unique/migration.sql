-- CreateIndex
CREATE INDEX "provider_userId_clientId" ON "User_OAuth2"("oauth2Id", "userId", "openId");
