import { PrismaClient } from '@prisma/client';
import { SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';
import { ServerContext } from '../../contracts/index.js';

export class LocationPointDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async findMany(context: ServerContext, filters: any) {
        return await this.prisma.locationPoint.findMany({ where: filters });
    }

    async findUnique(context: ServerContext, filters: any) {
        return await this.prisma.locationPoint.findUnique({ where: filters });
    }
}