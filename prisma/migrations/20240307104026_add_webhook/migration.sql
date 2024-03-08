-- CreateTable
CREATE TABLE "WebHook" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "WebHook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebHookHeader" (
    "id" SERIAL NOT NULL,
    "webHookId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "WebHookHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebHookEvent" (
    "id" SERIAL NOT NULL,
    "webHookId" INTEGER NOT NULL,
    "resource" TEXT NOT NULL,
    "operation" TEXT NOT NULL,

    CONSTRAINT "WebHookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebHook_name_key" ON "WebHook"("name");

-- AddForeignKey
ALTER TABLE "WebHookHeader" ADD CONSTRAINT "WebHookHeader_webHookId_fkey" FOREIGN KEY ("webHookId") REFERENCES "WebHook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebHookEvent" ADD CONSTRAINT "WebHookEvent_webHookId_fkey" FOREIGN KEY ("webHookId") REFERENCES "WebHook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
