import { GraphQLError } from 'graphql';
import { useAuthentication } from '../../decorators/index.js';
import { withAuthentication } from '../../decorators/index.js';
export const resolvers = {
    Query: {
        timeline: withAuthentication(async (parent, args, context, info) => {
            return await context.dataSources.post.getTimeline(context, args.input);
        }),
        trendingFeed: async (parent, args, context, info) => {
            return await context.dataSources.post.getTrendingFeed(context, args.input);
        },
    },
    Mutation: {
        createPost: withAuthentication(async (parent, args, context, info) => {
            return await useAuthentication.execute(async (parent, args, context, info) => {
                return context.dataSources.post.create(context, args.input);
            }, parent, args, context, info);

        }),
        follow: withAuthentication(async (parent, args, context, info) => {
            if (!args.input.openId && !args.input.snsName)
                throw new GraphQLError(`no user found`, {
                    extensions: {
                        code: 'Bad Request',
                    },
                });
            const result = await context.dataSources.follow.create(context, args.input);
            return result;
        }),
    },
    Post: {
        authorInfo: async (parent, args, context, info) => {
            return await context.dataSources.user.getPublicInfo(context, parent.authorId);
        },
    },
    SharedPublicPost: {
        authorInfo: async (parent, args, context, info) => {
            return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.authorId);
        },
    }
};