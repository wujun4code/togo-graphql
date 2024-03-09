import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { SessionContext, ServerContext } from '../contracts/index.js';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';

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

const filteredHeaders = [
    'connection',
    'host',
    'content-length',
    'transfer-encoding',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'authorization',
    'proxy-authorization',
    'expect',
];

export class WebHookService {

    wakeQ: queueAsPromised<WakeWebHookTask>;
    pushQ: queueAsPromised<PushWebHookTask>;
    prisma: PrismaClient;
    session: SessionContext;

    constructor(config: { prisma: PrismaClient, session: SessionContext }) {
        this.prisma = config.prisma;
        this.session = config.session;
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

        const { req }: { req: Request } = this.session.http;

        const targetUrl = arg.url;

        const filteredRequestHeaders = Object.fromEntries(
            Object.entries(req.headers).filter(
                ([headerName]) => !filteredHeaders.includes(headerName.toLowerCase())
            )
        );

        const axiosConfig: AxiosRequestConfig = {
            method: 'POST', 
            url: targetUrl, 
            data: arg.data, 
            headers: {
                ...filteredRequestHeaders,
                ...arg.headers,
                'X-Invoker-Origin': 'WebHook',
            },
        };

        try {
            const response: AxiosResponse = await axios(axiosConfig);

        } catch (error) {
            const { url, } = error.response?.config || {};
            const { status } = error.response;
            const simplifyMessage = { url, status };
            console.error('Error forwarding request:', simplifyMessage);
        }
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