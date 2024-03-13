import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';

export class UserDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    @injectUser()
    async getPublicInfo(context: ServerContext, userId: number) {
        const currentUserId = parseInt(context.session.user.id);
        const counts = await this.prisma.$queryRaw`
        SELECT
          (SELECT COUNT(*) FROM "Follow" WHERE "followeeId" = ${userId}) AS "followerCount",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${userId}) AS "followeeCount",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${currentUserId} AND "followeeId" = ${userId}) AS "currentUserFollowsTarget",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${userId} AND "followeeId" = ${currentUserId}) AS "targetUserFollowsCurrentUser",
          u."sub" AS "openId",
          u."snsName",
          u."friendlyName"
          FROM "User" u
          WHERE u."id" = ${userId};
          `;

        const followerCount = counts[0]?.followerCount || 0;
        const followeeCount = counts[0]?.followeeCount || 0;
        const currentUserFollowsTarget = counts[0]?.currentUserFollowsTarget || 0;
        const targetUserFollowsCurrentUser = counts[0]?.targetUserFollowsCurrentUser || 0;
        const openId = counts[0]?.openId || '';
        const snsName = counts[0]?.snsName || '';
        const friendlyName = counts[0]?.friendlyName || '';
        const data = {
            openId: openId,
            snsName: snsName,
            friendlyName: friendlyName,
            following: { totalCount: parseInt(followeeCount) },
            follower: { totalCount: parseInt(followerCount) },
            followRelation: {
                followed: currentUserFollowsTarget > 0,
                followingMe: targetUserFollowsCurrentUser > 0,
            }
        };

        return data;
    }
}