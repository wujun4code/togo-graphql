import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class FollowDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    @injectUser()
    async create(context: ServerContext, input: any) {

        const snsNameQuery = {
            where: {
                snsName: input.snsName,
            },
        };

        const followee = await this.prisma.user.findUnique(snsNameQuery);

        const currentUserId = parseInt(context.session.user.id);

        if (followee.id === currentUserId) {
            throw new GraphQLError(`can not follow yourself.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        const created = await this.prisma.follow.upsert({
            where: {
                followerId_followeeId: { followerId: currentUserId, followeeId: followee.id },
            },
            update: {},
            create: {
                followerId: currentUserId,
                followeeId: followee.id,
            }
        });


        const followInfo = await this.prisma.$queryRaw`
        select
        "followerId",
        "followeeId",
        row_number() over (partition by "followeeId"
        order by "followedAt") as follower_rank, 
        COUNT(*) over (partition by "followerId") as total_following
        from "Follow" 
        where "followerId" = ${currentUserId} and "followeeId" = ${followee.id} 
        `

        const followerRank = followInfo[0]?.follower_rank || 0;
        const totalFollowing = followInfo[0]?.total_following || 0;

        const result = {
            ...created,
            followerRank: parseInt(followerRank.toString()),
            totalFollowing: parseInt(totalFollowing.toString()),
        };

        const resourceName = "follow";

        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;


        webHook.invokeCreate(context, resourceName, 'create', created);

        return result;
    }

    async asFollower(context: ServerContext, input: any) {

        const { followerId, followeeId } = input;

        const data = await this.prisma.follow.findUnique({
            where: {
                followerId_followeeId: { followerId: followerId, followeeId: followeeId }
            },
            select: {
                followeeId: true,
                followerId: true,
                followedAt: true
            }
        });

        return data;
    }



    @injectUser()
    async delete(context: ServerContext, input: any) {

        const snsNameQuery = {
            where: {
                snsName: input.snsName,
            },
        };

        const followee = await this.prisma.user.findUnique(snsNameQuery);

        const currentUserId = parseInt(context.session.user.id);

        if (followee.id === currentUserId) {
            throw new GraphQLError(`can not unfollow yourself.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        const deleted = await this.prisma.follow.delete({
            where: {
                followerId_followeeId: { followerId: currentUserId, followeeId: followee.id },
            },
        });


        const totalFollowing = await this.prisma.follow.count({
            where: {
                followerId: currentUserId
            }
        });

        const result = {
            totalFollowing: parseInt(totalFollowing.toString()),
        };

        const resourceName = "follow";

        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;


        webHook.invokeCreate(context, resourceName, 'delete', deleted);

        return { ...deleted, totalFollowing };
    }
}