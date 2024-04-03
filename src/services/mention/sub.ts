import { PubSubService } from '@services/index.js';

export class MentionHistorySubWorker {
    pubSub: PubSubService;

    constructor(config: { pubSub: PubSubService }) {
        this.pubSub = config.pubSub;
    }

    start() {
        this.pubSub.subscribe('mentioned', 'created', (payload) => {
            console.log(`payload:${JSON.stringify(payload)}`);
        });
    }
}