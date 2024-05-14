-- CreateTable
CREATE TABLE "OAuth2" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "OAuth2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_OAuth2" (
    "id" SERIAL NOT NULL,
    "oauth2Id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "openId" TEXT NOT NULL,

    CONSTRAINT "User_OAuth2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_clientId" ON "OAuth2"("provider", "clientId");

-- AddForeignKey
ALTER TABLE "User_OAuth2" ADD CONSTRAINT "User_OAuth2_oauth2Id_fkey" FOREIGN KEY ("oauth2Id") REFERENCES "OAuth2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_OAuth2" ADD CONSTRAINT "User_OAuth2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
