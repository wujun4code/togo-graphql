-- CreateTable
CREATE TABLE "TravelPlan_PublicACLRule" (
    "id" SERIAL NOT NULL,
    "wildcard" TEXT NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "travelPlanId" INTEGER NOT NULL,

    CONSTRAINT "TravelPlan_PublicACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlan_PublicACLRule_wildcard_travelPlanId_key" ON "TravelPlan_PublicACLRule"("wildcard", "travelPlanId");

-- AddForeignKey
ALTER TABLE "TravelPlan_PublicACLRule" ADD CONSTRAINT "TravelPlan_PublicACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
