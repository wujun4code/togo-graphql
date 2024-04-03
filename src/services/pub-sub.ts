import { EventEmitter } from 'events';
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { SessionContext, ServerContext } from '../contracts/index.js';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { MentionHistorySubWorker } from '@services/mention/sub.js';

export interface SubscriptionMap {
    [key: string]: boolean;
}

export interface SubWorker {
    start(): void;
}

export class PubSubService extends EventEmitter {
    private static instance: PubSubService;
    private subscriptions: SubscriptionMap = {};
    prisma: PrismaClient;
    session: SessionContext;

    constructor(config: { prisma: PrismaClient, session: SessionContext }) {
        super();
        this.prisma = config.prisma;
        this.session = config.session;
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

// export const pubSubService = PubSubService.getInstance();

// pubSubService.subscribe('mentioned', 'created', (payload) => {

//     console.log(`payload:${JSON.stringify(payload)}`);
// });

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
}

export class BuiltInPubSubManager extends PubSubManager {
    constructor(config: { pubSub: PubSubService }) {
        super(config);
        this.addDefaultSubWorkers();
    }

    private addDefaultSubWorkers() {
        const mentionHistorySubWorker = new MentionHistorySubWorker({ pubSub: this.pubSub });
        this.addSubWorker(mentionHistorySubWorker);
    }
}