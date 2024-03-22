import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql'

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
          u."snsName",
          u."friendlyName"
          FROM "User" u
          WHERE u."id" = ${userId};
          `;

        const followerCount = counts[0]?.followerCount || 0;
        const followeeCount = counts[0]?.followeeCount || 0;
        const currentUserFollowsTarget = counts[0]?.currentUserFollowsTarget || 0;
        const targetUserFollowsCurrentUser = counts[0]?.targetUserFollowsCurrentUser || 0;
        const snsName = counts[0]?.snsName || '';
        const friendlyName = counts[0]?.friendlyName || '';
        const data = {
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

    async getUniqueUser(context: ServerContext, input: any) {
        if (!input.snsName)
            throw new GraphQLError(`no snsName or openId found`, {
                extensions: {
                    code: 'Bad Request',
                },
            });

        const snsNameQuery = {
            where: {
                snsName: input.snsName,
            },
        };

        const user = await this.prisma.user.findUnique(snsNameQuery);
        return user;
    }

    async getMyProfileByUserId(context: ServerContext, input: any) {
        const { userId } = input;

        const sharedPublicInfo = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: { followees: true, followers: true, oauth2Bindings: true }
                },
                id: true,
                snsName: true,
                friendlyName: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const data = {
            id: userId,
            snsName: sharedPublicInfo.snsName,
            friendlyName: sharedPublicInfo.friendlyName,
            createdAt: sharedPublicInfo.createdAt,
            updatedAt: sharedPublicInfo.updatedAt,
            following: { totalCount: sharedPublicInfo._count.followees },
            follower: { totalCount: sharedPublicInfo._count.followers },
        };

        return data;
    }

    async getOAuth2Bindings(context: ServerContext, input: any) {
        const { userId } = input;

        if (!input) input = {};

        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { updatedAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'createdAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: 'Bad Request',
                },
            });
        }

        const oAuth2Bindings = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: { oauth2Bindings: true, },
                },
                oauth2Bindings: {
                    where: {
                        ...filters,
                        ...cursorFilter,
                    },
                    orderBy: sorter ? sorter : {
                        updatedAt: 'desc',
                    },
                    take: limit,
                    ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                        cursor: {
                            updatedAt: cursor
                        }
                    }),
                    skip: skip,
                    select: {
                        oauth2: true,
                        openId: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
            },
        });
        return oAuth2Bindings;
    }

    async getSharedPublicProfileByUserId(context: ServerContext, userId: number) {
        return await this.getMyProfileByUserId(context, { userId: userId });
    }
    
    async getSharedPublicProfile(context: ServerContext, input: any) {

        const { id } = await this.getUniqueUser(context, input);
        return this.getSharedPublicProfileByUserId(context, id);
    }
}