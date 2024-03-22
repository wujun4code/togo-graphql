import { PrismaClient } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';

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
                    code: 'Bad Request',
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
            followerRank: parseInt(followerRank.toString()),
            totalFollowing: parseInt(totalFollowing.toString()),
        };

        const resourceName = "follow";

        const { services: { webHook }, dataSources: { acl }, session: { user } } = context;


        webHook.invokeCreate(context, resourceName, 'create', created);

        return result;
    }
}