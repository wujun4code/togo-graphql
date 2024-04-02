import { GraphQLError } from 'graphql';
import { useAuthentication } from '../../decorators/index.js';
import { withAuthentication } from '../../decorators/index.js';
import { GraphqlErrorCode } from '../../contracts/index.js';

export const resolvers = {
    Query: {
        followRelation: async (parent, args, context, info) => {
            if (!args.input.originalSnsName || !args.input.targetSnsName)
                throw new GraphQLError(`no user found`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const originalUser = await context.dataSources.user.getUniqueUser(context, { snsName: args.input.originalSnsName });
            const targetUser = await context.dataSources.user.getUniqueUser(context, { snsName: args.input.targetSnsName });
            const data = { originalUser, targetUser };
            return data;
        },
    },
    FollowRelation: {
        asFollower: async (parent, args, context, info) => {
            const follow = await context.dataSources.follow.asFollower(context, { followerId: parent.originalUser.id, followeeId: parent.targetUser.id });
            return follow;
        },
        asFollowee: async (parent, args, context, info) => {
            const follow = await context.dataSources.follow.asFollower(context, { followerId: parent.targetUser.id, followeeId: parent.originalUser.id });
            return follow;
        },
    },
    Follow: {
        follower: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.followerId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.followerId);
        },
        followee: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.followeeId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.followeeId);
        },
    },
    Mutation: {
        follow: withAuthentication(async (parent, args, context, info) => {
            if (!args.input.snsName)
                throw new GraphQLError(`no user found`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const result = await context.dataSources.follow.create(context, args.input);
            return result;
        }),
        unfollow: withAuthentication(async (parent, args, context, info) => {
            if (!args.input.snsName)
                throw new GraphQLError(`no user found`, {
                    extensions: {
                        code: GraphqlErrorCode.BAD_REQUEST,
                        name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                    },
                });
            const result = await context.dataSources.follow.delete(context, args.input);
            return result;
        }),
    },
};