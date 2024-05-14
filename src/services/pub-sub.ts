import { EventEmitter } from 'events';
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { SessionContext, ServerContext } from '../contracts/index.js';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { MentionHistorySubWorker, PostCreatedSubWorker, MentionedSubWorker, CommentCreatedSubWorker } from '../services/index.js';
import { PubSub } from 'graphql-subscriptions';
import { ProxyHookHttp } from './hook/proxy.http.js';

export interface SubscriptionMap {
    [key: string]: boolean;
}

export interface SubWorker {
    start(): void;
    stop(): void;
}

export class PubSubService extends EventEmitter {
    private subscriptions: SubscriptionMap = {};
    prisma: PrismaClient;
    session: SessionContext;
    gqlPubSub: PubSub;
    proxyHookHttp: ProxyHookHttp;

    constructor(config: {
        prisma: PrismaClient,
        session: SessionContext,
        gqlPubSub: PubSub,
        proxyHookHttp: ProxyHookHttp
    }) {
        super();
        this.prisma = config.prisma;
        this.session = config.session;
        this.gqlPubSub = config.gqlPubSub;
        this.proxyHookHttp = config.proxyHookHttp;
    }

    public publish(topic: string, event: string, payload: any) {
        const key = `${topic}:${event}`;
        if (this.subscriptions[key]) {
            this.emit(key, payload);
        }
    }

    public subscribe(topic: string, event: string, callback: (payload: any) => void) {
        const key = `${topic}:${event}`;
        if (!this.subscriptions[key]) {
            this.subscriptions[key] = true;
            this.on(key, callback);
        }
    }

    public unsubscribe(topic: string, event: string, callback: (payload: any) => void) {
        const key = `${topic}:${event}`;
        if (this.subscriptions[key]) {
            this.off(key, callback);
            delete this.subscriptions[key];
        }
    }

    // public static getInstance(): PubSubService {
    //     if (!PubSubService.instance) {
    //         PubSubService.instance = new PubSubService();
    //     }
    //     return PubSubService.instance;
    // }

    // set prisma(value: PrismaClient) {
    //     this._prisma = value;
    // }

    // get prisma() {
    //     return this._prisma;
    // }

    // set session(value: SessionContext) {
    //     this._session = value;
    // }

    // get session() {
    //     return this._session;
    // }
}

export class PubSubManager {
    protected pubSub: PubSubService;
    protected subWorkers: SubWorker[];

    constructor(config: { pubSub: PubSubService }) {
        this.pubSub = config.pubSub;
        this.subWorkers = [];
    }

    addSubWorker(subWorker: SubWorker) {
        this.subWorkers.push(subWorker);
    }

    startAllSubWorkers() {
        this.subWorkers.forEach(subWorker => subWorker.start());
    }

    unsubscribeAll() {
        this.subWorkers.forEach(subscription => {
            subscription.stop();
        });
        this.subWorkers = [];
    }
}

export class BuiltInPubSubManager extends PubSubManager {
    constructor(config: { pubSub: PubSubService }) {
        super(config);
        this.addDefaultSubWorkers();
    }

    private addDefaultSubWorkers() {
        const mentionHistorySubWorker = new MentionHistorySubWorker({ pubSub: this.pubSub });
        const postSubWorker = new PostCreatedSubWorker({ pubSub: this.pubSub });
        const mentionedSubWorker = new MentionedSubWorker({ pubSub: this.pubSub });
        const commentSubWorker = new CommentCreatedSubWorker({ pubSub: this.pubSub });
        this.addSubWorker(mentionHistorySubWorker);
        this.addSubWorker(postSubWorker);
        this.addSubWorker(mentionedSubWorker);
        this.addSubWorker(commentSubWorker);
    }
}