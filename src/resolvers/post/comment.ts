import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Query: {

    },
    Mutation: {
        createComment: withAuthentication(async (parent, args, context, info) => {
            return await context.dataSources.post.createComment(context, args.input);
        }),
    },
    Comment: {
        authorInfo: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.authorId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.authorId);
        },
        post: async (parent, args, context, info) => {
            return await context.dataSources.post.getPost(context, { id: parent.postId });
        }
    },
};