import { PubSubService, SubWorker } from '../index.js';
import { Mention } from './parser.js';

export class MentionHistorySubWorker implements SubWorker {
    pubSub: PubSubService;

    constructor(config: { pubSub: PubSubService }) {
        this.pubSub = config.pubSub;
    }

    async addMentionHistory(payload: any) {

        const { post } = payload;

        const mentioned = payload.mentioned as Mention[];
        const { prisma } = this.pubSub;
        if (!mentioned || !Array.isArray(mentioned)) return;

        const snsNames = mentioned.map((item, index) => {
            if (item.type === 'usns') return item.id;
        }).filter(id => id !== undefined);

        const openIds = mentioned.map((item, index) => {
            if (item.type === 'uoid') return item.id;
        }).filter(id => id !== undefined);

        const ids = mentioned.map((item, index) => {
            if (item.type === 'u') return parseInt(item.id);
        }).filter(id => id !== undefined);

        const mentionedUsers = await prisma.user.findMany({
            where: {
                OR: [
                    ...(ids.length > 0 ? [{ id: { in: ids } }] : []),
                    ...(snsNames.length > 0 ? [{ snsName: { in: snsNames } }] : []),
                    ...(openIds.length > 0 ? [{ openId: { in: openIds } }] : []),
                ],

            },
            select: {
                id: true,
                snsName: true,
                friendlyName: true,
                openId: true,
                userType: true,
            }
        });

        const getFriendlyName = (mentioned: Mention[], user: any) => {
            let friendlyName = user.friendlyName;

            for (let index = 0; index < mentioned.length; index++) {
                const element = mentioned[index];
                if (element.type === 'u' && element.id === user.id.toString()) {
                    friendlyName = element.displayName;
                    break;
                }

                if (element.type === 'uoid' && element.id === user.openId) {
                    friendlyName = element.displayName;
                    break;
                }
                if (element.type === 'usns' && element.id === user.snsName) {
                    friendlyName = element.displayName;
                    break;
                }
            }

            return friendlyName;

        };

        const data = await prisma.mentionedHistory.createMany({
            data: mentionedUsers.map((user, i) => {
                return {
                    relatedPostId: parseInt(post.id),
                    mentionedUserId: user.id,
                    mentionerUserId: parseInt(post.authorId),
                    mentionedFriendlyName: getFriendlyName(mentioned, user),
                };
            },),
        });

        const transactionData = await prisma.$transaction(
            mentionedUsers.map((user) => prisma.mentionedHistory.create({
                data: {
                    relatedPostId: parseInt(post.id),
                    mentionedUserId: user.id,
                    mentionerUserId: parseInt(post.authorId),
                    mentionedFriendlyName: getFriendlyName(mentioned, user),
                }
            }))
        );

        for (const item of transactionData) {
            const user = mentionedUsers.find(user => user.id === item.mentionedUserId);
            this.pubSub.publish('user', 'mentioned', { post: post, mentionHistory: item });
            if (user && user.userType === "BOT") {
                this.pubSub.publish('robot', 'mentioned', { post: post, mentionHistory: item });
            }
        }
    }

    start() {
        this.pubSub.subscribe('mentioned-in-post', 'created', this.addMentionHistory.bind(this));
    }

    stop() {
        this.pubSub.unsubscribe('mentioned-in-post', 'created', this.addMentionHistory);
    }
}