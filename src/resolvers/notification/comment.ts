
import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Subscription: {
        commentCreated: {
            subscribe: withAuthentication(async (parent, args, context, info) => {
                const {
                    session: { user }
                } = context;
                return context.services.gqlPubSub.asyncIterator([`COMMENT_CREATED_${user.id}`]);
            }),
        },
        unreadCommentNotificationCreated: {
            subscribe: withAuthentication(async (parent, args, context, info) => {
                const {
                    session: { user }
                } = context;
                return context.services.gqlPubSub.asyncIterator([`UNREAD_COMMENT_NOTIFICATION_CREATED_${user.id}`]);
            }),
        },
    },

    UserUnreadCommentNotificationConnection: {
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
    UnreadCommentNotification: {
        relatedComment: async (parent, args, context, info) => {

            const { mentionHistory } = context.dataSources;

            const data = await mentionHistory.findById(context, { id: parent.relatedHistoryId });

            return data;
        }
    },
};