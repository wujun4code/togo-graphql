import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    
    Query: {
        unreadNotification: withAuthentication(async (parent, args, context, info) => {
            return {};
        }),
    },

    UnreadNotification: {
        unreadMentioned: withAuthentication(async (parent, args, context, info) => {
            const {
                notification
            } = context.dataSources;

            const list = await notification.latestUnreadMentionedNotifications(context, args.input);

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
        }),
    },
};