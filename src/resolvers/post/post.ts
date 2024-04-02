import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Query: {
        timeline: withAuthentication(async (parent, args, context, info) => {
            return {};
        }),
        trendingFeed: async (parent, args, context, info) => {
            return {};
        },
        post: async (parent, args, context, info) => {
            return await context.dataSources.post.getPost(context, { id: parseInt(args.id) });
        },
    },
    Mutation: {
        createPost: withAuthentication(async (parent, args, context, info) => {
            return await context.dataSources.post.create(context, args.input);
        }),
    },
    Timeline: {
        posts: withAuthentication(async (parent, args, context, info) => {
            const list = await context.dataSources.post.getTimeline(context, args.input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.postedAt, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].postedAt : ''
                },
                totalCount: 0,
            };

            return connection;
        }),
    },
    TrendingFeed: {
        posts: async (parent, args, context, info) => {
            const list = await context.dataSources.post.getTrendingFeed(context, args.input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.postedAt, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].postedAt : ''
                },
                totalCount: 0,
            };

            return connection;
        },
    },
    Post: {
        authorInfo: async (parent, args, context, info) => {
            if (context.session.user)
                return await context.dataSources.user.getPublicInfo(context, parent.authorId);
            else return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.authorId);
        },

        comments: async (parent, args, context, info) => {
            const input = { ...args.input, postId: parent.id };
            const list = await context.dataSources.post.findRootComments(context, input);

            const connection = {
                edges: list.map(n => {
                    return { cursor: n.createdAt, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: list.length > 0 ? list[list.length - 1].createdAt : ''
                },
                totalCount: 0,
            };

            return connection;
        },
    },
    SharedPublicPost: {
        authorInfo: async (parent, args, context, info) => {
            return await context.dataSources.user.getSharedPublicProfileByUserId(context, parent.authorId);
        },
    }
};