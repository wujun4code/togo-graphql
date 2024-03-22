/*
  Warnings:

  - A unique constraint covering the columns `[provider,clientId]` on the table `OAuth2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[oauth2Id,userId,openId]` on the table `User_OAuth2` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "provider_clientId";

-- DropIndex
DROP INDEX "provider_userId_clientId";

-- CreateIndex
CREATE UNIQUE INDEX "OAuth2_provider_clientId_key" ON "OAuth2"("provider", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_OAuth2_oauth2Id_userId_openId_key" ON "User_OAuth2"("oauth2Id", "userId", "openId");
