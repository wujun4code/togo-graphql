import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Query: {
        publicProfile: async (parent, args, context, info) => {
            return await context.dataSources.user.getSharedPublicProfile(context, args.input);
        },
        userProfile: withAuthentication(async (parent, args, context, info) => {
            const {
                session: { user }
            } = context;
            return await context.dataSources.user.getMyProfileByUserId(context, { userId: parseInt(user.id) });
        }),
        authentication: async (parent, args, context, info) => {
            const { basic, extra } = await context.services.jwt.getProfile(args.input);
            const jwt = await context.services.jwt.getJwt(basic);
            return { jwt, basic, extra };
        },
    },
    Authentication: {
        profile: async (parent, args, context, info) => {
            const { basic, extra } = parent;
            const { id } = await context.dataSources.user.createOrGetUser(context, { basic, extra });
            return await context.dataSources.user.getMyProfileByUserId(context, { userId: id });
        },
    },
    PrivateProfileInfo: {
        oauth2BindingsConnection: withAuthentication(async (parent, args, context, info) => {
            const { oauth2Bindings, _count } = await context.dataSources.user.getOAuth2Bindings(context, {
                ...args.input,
                userId: parseInt(parent.id)
            });

            const result = {
                edges: oauth2Bindings.map(n => {
                    return { cursor: n.updatedAt, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: oauth2Bindings.length > 0 ? oauth2Bindings[oauth2Bindings.length - 1].updatedAt : ''
                },
                totalCount: _count.oauth2Bindings
            };

            return result;
        }),
    },
    SharedPublicProfileInfo: {
        posts: async (parent, args, context, info) => {
            const list = await context.dataSources.post.getByUser(context, { ...args.input, userId: parent.id });

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
};