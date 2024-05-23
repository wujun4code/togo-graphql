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
        batchPublicProfiles: async (parent, args, context, info) => {
            const { input } = args;

            const list = await Promise.all(
                input.map(async (profileInput) => {
                    // 调用 publicProfile 逻辑，并返回结果
                    return await resolvers.Query.publicProfile(parent, { input: profileInput }, context, info);
                })
            );

            return list;
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
        apiClientConnection: withAuthentication(async (parent, args, context, info) => {
            console.log(`PrivateProfileInfo.apiClientConnection.parent`, parent);
            const { authorizedClients, _count } = await context.dataSources.user.getAPIClients(context, {
                ...args.input,
                userId: parseInt(parent.id)
            });

            const result = {
                edges: authorizedClients.map(n => {
                    return { cursor: n.updatedAt, node: n };
                }),
                pageInfo: {
                    hasNextPage: false,
                    endCursor: authorizedClients.length > 0 ? authorizedClients[authorizedClients.length - 1].updatedAt : ''
                },
                totalCount: _count.authorizedClients
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