import { GraphQLError } from 'graphql';
import { useAuthentication } from '../../decorators/index.js';
import { withAuthentication } from '../../decorators/index.js';
import { GraphqlErrorCode } from '../../contracts/index.js';

export const resolvers = {
    Query: {
        suggestingToMention: withAuthentication(async (parent, args, context, info) => {
            return {};
        }),
    },
    SuggestingToMention: {
        asMentioner: withAuthentication(async (parent, args, context, info) => {

            const list = await context.dataSources.mentionHistory.findAsMentioner(context, args.input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.id, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].id : ''
                },
                //totalCount: 0,
            };

            return { ...connection, input: args.input };
        }),
    },
    MentionerMentionHistoryConnection: {
        totalCount: async (parent, args, context, info) => {

            const count = await context.dataSources.mentionHistory.countAsMentioner(context, parent.input);
            return count;
        },
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