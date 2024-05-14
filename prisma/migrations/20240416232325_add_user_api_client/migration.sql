-- CreateTable
CREATE TABLE "UserAPIClient" (
    "id" SERIAL NOT NULL,
    "apiId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "bindingUserId" INTEGER NOT NULL,

    CONSTRAINT "UserAPIClient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAPIClient" ADD CONSTRAINT "UserAPIClient_bindingUserId_fkey" FOREIGN KEY ("bindingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
