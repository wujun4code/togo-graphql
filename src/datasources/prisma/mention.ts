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

    async findAsMentioner(context: ServerContext, input: any) {
        const currentUserId = parseInt(context.session.user.id);
        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { created: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'created'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }
        const mentionHistoryAsMentioner = await this.prisma.mentionedHistory.findMany({
            where: {
                ...filters,
                mentionerUserId: currentUserId,
            },
            ...(cursor && sortedKey && supportedSortFields.includes(sortedKey) && {
                cursor: {
                    createdAt: cursor
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