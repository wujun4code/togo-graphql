import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext, IOAuth2BasicInfo, OAuthUserInfo, GraphqlErrorCode } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';

export class UserDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async createOrGetUser(context: ServerContext, oauth2: OAuthUserInfo) {
        const { basic, extra } = oauth2;
        const data = await this.prisma.user.upsert({
            where: { email: basic.email },
            update: {
                avatar: extra.avatar,
                bio: extra.bio
            },
            create: {
                username: basic.username,
                snsName: basic.username,
                friendlyName: basic.friendlyName,
                email: basic.email,
                avatar: extra.avatar,
                bio: extra.bio,
                oauth2Bindings: {
                    create: [basic.sub].map((openId) => ({
                        openId: openId.toString(),
                        site: extra.site,
                        avatar: extra.avatar,
                        oauth2: {
                            connectOrCreate: {
                                where: { unique_provider_clientId: { provider: basic.provider, clientId: basic.clientId } },
                                create: { provider: basic.provider, clientId: basic.clientId },
                            }
                        }
                    }))
                }
            },
            select: {
                id: true,
            }
        });

        await this.prisma.user_OAuth2.updateMany({
            where: {
                oauth2: {
                    provider: basic.provider,
                    clientId: basic.clientId
                },
                user: {
                    email: basic.email,
                }
            },
            data: {
                site: extra.site,
                avatar: extra.avatar,
                bio: extra.bio,
            }
        });


        return data;
    }

    async getPublicInfo(context: ServerContext, userId: number) {
        const currentUserId = parseInt(context.session.user.id);
        const counts = await this.prisma.$queryRaw`
        SELECT
          (SELECT COUNT(*) FROM "Follow" WHERE "followeeId" = ${userId}) AS "followerCount",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${userId}) AS "followeeCount",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${currentUserId} AND "followeeId" = ${userId}) AS "currentUserFollowsTarget",
          (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${userId} AND "followeeId" = ${currentUserId}) AS "targetUserFollowsCurrentUser",
          u."snsName",
          u."openId",
          u."friendlyName",
          u."avatar",
          u."bio"
          FROM "User" u
          WHERE u."id" = ${userId};
          `;

        const followerCount = counts[0]?.followerCount || 0;
        const followeeCount = counts[0]?.followeeCount || 0;
        const currentUserFollowsTarget = counts[0]?.currentUserFollowsTarget || 0;
        const targetUserFollowsCurrentUser = counts[0]?.targetUserFollowsCurrentUser || 0;
        const snsName = counts[0]?.snsName || '';
        const openId = counts[0]?.openId || '';
        const friendlyName = counts[0]?.friendlyName || '';
        const avatar = counts[0]?.avatar || '';
        const bio = counts[0]?.bio || '';
        const data = {
            id: userId,
            snsName: snsName,
            openId: openId,
            friendlyName: friendlyName,
            following: { totalCount: parseInt(followeeCount) },
            follower: { totalCount: parseInt(followerCount) },
            followRelation: {
                followed: currentUserFollowsTarget > 0,
                followingMe: targetUserFollowsCurrentUser > 0,
            },
            avatar: avatar,
            bio: bio,
        };

        return data;
    }

    async getUniqueUser(context: ServerContext, input: any) {
        if (!input.snsName)
            throw new GraphQLError(`no snsName or openId found`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
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
                    select: { asFollowees: true, asFollowers: true, oauth2Bindings: true }
                },
                id: true,
                snsName: true,
                friendlyName: true,
                createdAt: true,
                updatedAt: true,
                openId: true,
                avatar: true,
                bio: true
            },
        });

        const data = {
            id: userId,
            openId: sharedPublicInfo.openId,
            snsName: sharedPublicInfo.snsName,
            friendlyName: sharedPublicInfo.friendlyName,
            createdAt: sharedPublicInfo.createdAt,
            updatedAt: sharedPublicInfo.updatedAt,
            following: { totalCount: sharedPublicInfo._count.asFollowers },
            follower: { totalCount: sharedPublicInfo._count.asFollowees },
            avatar: sharedPublicInfo.avatar,
            bio: sharedPublicInfo.bio,
        };

        return data;
    }

    async getAPIClients(context: ServerContext, input: any) {
        const { userId } = input;

        const {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        } = this.prepareFilters(input);

        const authorizedClients = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: { authorizedClients: true, },
                },
                authorizedClients: {
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
                            id: cursor
                        }
                    }),
                    skip: skip,
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        apiId: true,
                        apiKey: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
            },
        });
        return authorizedClients;
    }

    async getOAuth2Bindings(context: ServerContext, input: any) {
        const { userId } = input;

        const {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        } = this.prepareFilters(input);

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
                            id: cursor
                        }
                    }),
                    skip: skip,
                    select: {
                        oauth2: true,
                        openId: true,
                        createdAt: true,
                        updatedAt: true,
                        site: true,
                        avatar: true,
                        bio: true
                    }
                },
            },
        });
        return oAuth2Bindings;
    }

    async getSharedPublicProfileByUserId(context: ServerContext, userId: number) {
        return await this.getMyProfileByUserId(context, { userId: userId });
    }

    async findManySharedPublicProfileInUserIds(context: ServerContext, input: any) {
        const { userIds } = input;

        const sharedPublicInfos = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                _count: {
                    select: { asFollowees: true, asFollowers: true, oauth2Bindings: true }
                },
                id: true,
                snsName: true,
                friendlyName: true,
                createdAt: true,
                updatedAt: true,
                openId: true,
                avatar: true,
                bio: true
            },
        });

        const data = sharedPublicInfos.map((sharedPublicInfo, index) => ({
            id: sharedPublicInfo.id,
            openId: sharedPublicInfo.openId,
            snsName: sharedPublicInfo.snsName,
            friendlyName: sharedPublicInfo.friendlyName,
            createdAt: sharedPublicInfo.createdAt,
            updatedAt: sharedPublicInfo.updatedAt,
            following: { totalCount: sharedPublicInfo._count.asFollowers },
            follower: { totalCount: sharedPublicInfo._count.asFollowees },
            avatar: sharedPublicInfo.avatar,
            bio: sharedPublicInfo.bio,
        }));

        return data;
    }

    async getSharedPublicProfile(context: ServerContext, input: any) {
        const user = await this.getUniqueUser(context, input);
        if (!user) {
            throw new GraphQLError(`no snsName or openId found for ${input.snsName}`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const { id } = await this.getUniqueUser(context, input);
        return this.getSharedPublicProfileByUserId(context, id);
    }

    async createAPIClient(context: ServerContext, input: any) {
        const { name, description, userId } = input;
        if (!name) {
            throw new GraphQLError(`name is required`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        const apiClient = await this.prisma.userAPIClient.create({
            data: {
                name,
                description,
                bindingUserId: userId,
            },
        });
        return apiClient;
    }
}