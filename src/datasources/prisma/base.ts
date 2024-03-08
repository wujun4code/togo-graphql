import { PrismaClient } from '@prisma/client';
import { IContextDataSource } from '../context-base.js';
import { SessionContext } from '../../contracts/index.js';

export class PrismaDataSource implements IContextDataSource {
    session: SessionContext;
    prisma: PrismaClient;
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        this.prisma = config.client;
        this.session = config.session;
    }
}