import { PrismaClient } from '@prisma/client';
import { SessionContext } from '../../contracts/index.js';
import { PrismaDataSource } from './base.js';
import { ServerContext } from '../../contracts/index.js';

export class WebHookDataSource extends PrismaDataSource {
    constructor(config: { client: PrismaClient, session: SessionContext }) {
        super(config);
    }

    async create(context: ServerContext, data: any) {
        const { name, url, headers, events } = data;
        const newData = {
            name: name,
            url: url,
            headers: {
                create: headers,
            },
            events: {
                create: events,
            }
        };

        const newWebHook = await this.prisma.webHook.create({ data: newData });
        await context.services.webHook.invokeCreate(context, 'webhook', 'create', newWebHook);
        return newWebHook;
    }

    async findAll(context: ServerContext, filters: any) {
        return await this.prisma.webHook.findMany({ where: filters });
    }

    async findUnique(context: ServerContext, filters: any) {
        return await this.prisma.webHook.findUnique({ where: filters });
    }

    async findEventsByWebHookId(context: ServerContext, webHookId: any) {
        const webHookEvents = await this.prisma.webHookEvent.findMany({
            where: {
                webHookId: webHookId
            }
        });

        return webHookEvents;
    }

    async findHeadersByWebHookId(context: ServerContext, webHookId: any) {
        const webHookHeaders = await this.prisma.webHookHeader.findMany({
            where: {
                webHookId: webHookId
            }
        });

        return webHookHeaders;
    }
}