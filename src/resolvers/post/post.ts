import { checkRole, ensureUserInitialized } from '../../decorators/index.js';
import { GraphQLError } from 'graphql';
export const resolvers = {
    Query: {
        timeline: async (parent, args, context, info) => {
            return await context.dataSources.post.getTimeline(context, args.input);
        },
    },
    Mutation: {
        createPost: async (parent, args, context, info) => {
            return context.dataSources.post.create(context, args.input);
        },
        follow: async (parent, args, context, info) => {
            if (!args.input.openId && !args.input.snsName)
                throw new GraphQLError(`no user found`, {
                    extensions: {
                        code: 'Bad Request',
                    },
                });
            const result = await context.dataSources.follow.create(context, args.input);
            return result;
        },
    },
    Post: {
        authorInfo: async (parent, args, context, info) => {
            return await context.dataSources.user.getPublicInfo(context, parent.authorId);
        },
    }
};