-- CreateTable
CREATE TABLE "TravelPlanACLRule" (
    "id" SERIAL NOT NULL,
    "wildcard" TEXT,
    "roleId" INTEGER,
    "userId" INTEGER,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER,

    CONSTRAINT "TravelPlanACLRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelPlanACLRule" ADD CONSTRAINT "TravelPlanACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlanACLRule" ADD CONSTRAINT "TravelPlanACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlanACLRule" ADD CONSTRAINT "TravelPlanACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
