import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { SessionContext, ServerContext } from '../contracts/index.js';
import { PrismaClient } from '@prisma/client';
import { ProxyHookHttp } from './hook/proxy.http.js';

type WakeWebHookTask = {
    resource: string;
    operation: string;
    before: any;
    after: any;
}

type PushWebHookTask = {
    url: string;
    headers: any;
    data: any;
}


export class WebHookService {

    wakeQ: queueAsPromised<WakeWebHookTask>;
    pushQ: queueAsPromised<PushWebHookTask>;
    prisma: PrismaClient;
    session: SessionContext;
    proxyHookHttp: ProxyHookHttp;

    constructor(config: { prisma: PrismaClient, session: SessionContext, proxyHookHttp: ProxyHookHttp }) {
        this.prisma = config.prisma;
        this.session = config.session;
        this.proxyHookHttp = config.proxyHookHttp;
    }

    async start() {
        this.wakeQ = fastq.promise<WebHookService, WakeWebHookTask, void>(this, this.wake, 1);
        this.pushQ = fastq.promise<WebHookService, PushWebHookTask, void>(this, this.sendRequest, 5);
    }

    async wake(arg: WakeWebHookTask) {
        try {
            const webHooks = await this.prisma.webHook.findMany({
                select: {
                    headers: true,
                    url: true,
                    id: true
                },
                where: {
                    events: {
                        every: {
                            resource: arg.resource,
                            operation: arg.operation
                        }
                    }
                }
            });
            webHooks.forEach(element => {
                this.pushQ.push({
                    url: element.url,
                    headers: element.headers.map(h => {
                        return { key: h.key, value: h.value };
                    }),
                    data: arg,
                });
            });
        } catch (error) {
            console.error(error);
        }
    }

    async sendRequest(arg: PushWebHookTask) {
        await this.proxyHookHttp.sendRequest(arg);
    }

    async invokeCreate(context: ServerContext, resource: string, operation: string, after: any) {
        this.wakeQ.push({
            resource: resource,
            operation: operation,
            before: {},
            after: after
        });
    }
}