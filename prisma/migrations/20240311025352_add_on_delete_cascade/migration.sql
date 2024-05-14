-- DropForeignKey
ALTER TABLE "TravelPlan_PublicACLRule" DROP CONSTRAINT "TravelPlan_PublicACLRule_travelPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlan_RoleACLRule" DROP CONSTRAINT "TravelPlan_RoleACLRule_travelPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlan_UserACLRule" DROP CONSTRAINT "TravelPlan_UserACLRule_travelPlanId_fkey";

-- AddForeignKey
ALTER TABLE "TravelPlan_UserACLRule" ADD CONSTRAINT "TravelPlan_UserACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan_RoleACLRule" ADD CONSTRAINT "TravelPlan_RoleACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlan_PublicACLRule" ADD CONSTRAINT "TravelPlan_PublicACLRule_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "TravelPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
