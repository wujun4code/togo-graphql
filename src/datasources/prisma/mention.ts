import { PrismaClient, Prisma } from '@prisma/client';
import { ServerContext, SessionContext } from '../../contracts/index.js';
import { injectUser } from '../../decorators/index.js';
import { PrismaDataSource } from './base.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class MentionHistoryDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async findById(context: ServerContext, input: any) {

        if (!input || !input.id) {
            throw new GraphQLError('Invalid Id', {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const mentionHistory = await this.prisma.mentionedHistory.findUnique({
            where: {
                id: input.id,
            },
        });
        return mentionHistory;
    }

    async countAsMentioner(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        if (!input) input = {};

        const rawData = await this.prisma.$queryRaw`

        SELECT COUNT(DISTINCT "mentionedUserId") AS "TotalMentionedCount"
        FROM "MentionedHistory" mh where "mentionerUserId" = ${currentUserId}`;
        return parseInt(rawData[0]?.TotalMentionedCount) || 0;
    }

    async findAsMentioner(context: ServerContext, input: any) {
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

        const mentionHistoryAsMentioner = await this.prisma.mentionedHistory.findMany({
            distinct: ['mentionedUserId'],
            where: {
                ...filters,
                mentionerUserId: currentUserId,
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
            //skip: skip,
        });

        return mentionHistoryAsMentioner;
    }
}