-- CreateTable
CREATE TABLE "TravelPlanUserACLRule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER NOT NULL,

    CONSTRAINT "TravelPlanUserACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelPlanRoleACLRule" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER NOT NULL,

    CONSTRAINT "TravelPlanRoleACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlanUserACLRule_userId_travelPlanId_key" ON "TravelPlanUserACLRule"("userId", "travelPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlanRoleACLRule_roleId_travelPlanId_key" ON "TravelPlanRoleACLRule"("roleId", "travelPlanId");

-- AddForeignKey
ALTER TABLE "TravelPlanUserACLRule" ADD CONSTRAINT "TravelPlanUserACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlanUserACLRule" ADD CONSTRAINT "TravelPlanUserACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlanRoleACLRule" ADD CONSTRAINT "TravelPlanRoleACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlanRoleACLRule" ADD CONSTRAINT "TravelPlanRoleACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
