import { PrismaClient } from '@prisma/client';
import { IContextDataSource } from '../context-base.js';
import { SessionContext } from '../../contracts/index.js';
import { GraphQLError } from 'graphql';
import { GraphqlErrorCode } from '../../contracts/index.js';

export class PrismaDataSource implements IContextDataSource {
    session: SessionContext;
    prisma: PrismaClient;
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        this.prisma = config.client;
        this.session = config.session;
    }

    prepareFilters(input: any) {
        if (!input) input = {};
        const limit = input.limit ? input.limit : 10;
        const skip = input.skip ? input.skip : 0;
        const sorter = input.sorted ? input.sorted : { createdAt: 'desc' };
        const filters = input.filters ? input.filters : {};
        const cursor = input.cursor ? input.cursor : null;
        const sortedKey = Object.keys(sorter)[0];
        const sortValue = Object.values(sorter)[0]
        const cursorFilter = cursor != null ? sortValue === 'desc' ? { [sortedKey]: { lt: cursor } } : { [sortedKey]: { gt: cursor } } : {};

        const supportedSortFields = ['updatedAt', 'id', 'createdAt'];
        if (!supportedSortFields.includes(sortedKey)) {
            throw new GraphQLError(`${sortedKey} in not a one of supported sort fields.`, {
                extensions: {
                    code: GraphqlErrorCode.BAD_REQUEST,
                    name: GraphqlErrorCode[GraphqlErrorCode.BAD_REQUEST],
                },
            });
        }

        return {
            limit,
            skip,
            sorter,
            filters,
            cursor,
            sortedKey,
            sortValue,
            cursorFilter,
            supportedSortFields,
        };
    }
}