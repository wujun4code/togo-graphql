import { GraphQLError } from 'graphql';
import { useAuthentication } from '../../decorators/index.js';
import { withAuthentication } from '../../decorators/index.js';
import { GraphqlErrorCode } from '../../contracts/index.js';

export const resolvers = {
    Query: {
        suggestingToType: withAuthentication(async (parent, args, context, info) => {

            const list = await context.dataSources.mention.findAsMentioner(context, args.input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.created, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].created : ''
                },
                totalCount: 0,
            };

            return connection;
        }),
    },
    MentionHistory: {
        relatedComment: async (parent, args, context, info) => {
            return await context.dataSources.post.getComment(context, { id: parseInt(parent.relatedCommentId) });
        },
        relatedPost: async (parent, args, context, info) => {
            return await context.dataSources.post.getPost(context, { id: parseInt(parent.relatedPostId) });
        },
        mentioner: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.mentionerUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.mentionerUserId);
        },
        mentioned: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.mentionedUserId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.mentionedUserId);
        },
    },
};