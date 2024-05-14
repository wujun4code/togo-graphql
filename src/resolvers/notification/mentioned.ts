
import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Subscription: {
        mentionedCreated: {
            subscribe: withAuthentication(async (parent, args, context, info) => {
                const {
                    session: { user }
                } = context;
                return context.services.gqlPubSub.asyncIterator([`MENTIONED_CREATED_${user.id}`]);
            }),
        },
        unreadMentionedNotificationCreated: {
            subscribe: withAuthentication(async (parent, args, context, info) => {
                const {
                    session: { user }
                } = context;
                return context.services.gqlPubSub.asyncIterator([`UNREAD_MENTIONED_NOTIFICATION_CREATED_${user.id}`]);
            }),
        },
    },

    UserUnreadMentionedNotificationConnection: {
        totalCount: async (parent, args, context, info) => {
            const currentUserId = parseInt(context.session.user.id);
            const {
                notification
            } = context.dataSources;
            const count = await notification.prisma.unreadMentionedNotification.count({
                where: {
                    mentionedUserId: currentUserId,
                },
            });
            return count;
        },
    },
    UnreadMentionedNotification: {
        relatedHistory: async (parent, args, context, info) => {

            const { mentionHistory } = context.dataSources;

            const data = await mentionHistory.findById(context, { id: parent.relatedHistoryId });

            return data;
        }
    },
};