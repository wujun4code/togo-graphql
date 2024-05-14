import { PrismaClient, Prisma } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class NotificationDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async latestUnreadMentionedNotifications(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);

        const {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        } = this.prepareFilters(input);

        const notifications = await this.prisma.unreadMentionedNotification.findMany({
            where: {
                mentionedUserId: currentUserId,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    id: cursor
                }
            }),
            orderBy: sorter ? sorter : {
                createdAt: 'desc',
            },
            take: limit,
        });

        return notifications;
    }

}