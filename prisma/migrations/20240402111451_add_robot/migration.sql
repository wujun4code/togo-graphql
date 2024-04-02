-- CreateTable
CREATE TABLE "Robot" (
    "id" SERIAL NOT NULL,
    "hookUrl" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "managedOrganizationId" INTEGER,

    CONSTRAINT "Robot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RobotHookHeader" (
    "id" SERIAL NOT NULL,
    "robotId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobotHookHeader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Robot_createdAt_key" ON "Robot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Robot_updatedAt_key" ON "Robot"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RobotHookHeader_createdAt_key" ON "RobotHookHeader"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RobotHookHeader_updatedAt_key" ON "RobotHookHeader"("updatedAt");

-- AddForeignKey
ALTER TABLE "Robot" ADD CONSTRAINT "Robot_managedOrganizationId_fkey" FOREIGN KEY ("managedOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RobotHookHeader" ADD CONSTRAINT "RobotHookHeader_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
