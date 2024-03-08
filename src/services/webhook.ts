import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { ServerContext } from '../contracts/index.js';
import { PrismaClient } from '@prisma/client';

type WakeWebHookTask = {
    resource: string;
    operation: string;
    before: any;
    after: any;
}

type PushWebHookTask = {
    url: string;
    data: any;
}

export class WebHookService {

    wakeQ: queueAsPromised<WakeWebHookTask>;
    pushQ: queueAsPromised<PushWebHookTask>;
    prisma: PrismaClient;

    constructor(config: { prisma: PrismaClient }) {
        this.prisma = config.prisma;
    }

    async start() {
        this.wakeQ = fastq.promise<WebHookService, WakeWebHookTask, void>(this, this.wake, 1);
        this.pushQ = fastq.promise<WebHookService, PushWebHookTask, void>(this, this.sendRequest, 5);
    }

    async wake(arg: WakeWebHookTask) {
        try {
            const webHooks = await this.prisma.webHook.findMany({
                select: {
                    events: {
                        where: {
                            resource: arg.resource,
                            operation: arg.operation,
                        }
                    }
                }
            });
            console.log(`webHooks:${JSON.stringify(webHooks)}`);
        } catch (error) {
            console.error(error);
        }
    }

    async sendRequest(arg: PushWebHookTask) {

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