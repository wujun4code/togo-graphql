import { PubSubService, SubWorker } from '../index.js';

export class MentionedSubWorker implements SubWorker {
    pubSub: PubSubService;

    constructor(config: { pubSub: PubSubService }) {
        this.pubSub = config.pubSub;
    }

    async pushNotification(payload: any) {

        const { mentionHistory } = payload;

        const { gqlPubSub, prisma } = this.pubSub;
        const { mentionedUserId, id } = mentionHistory;

        gqlPubSub.publish(`MENTIONED_CREATED_${mentionedUserId}`, { mentionedCreated: mentionHistory });

        const unreadMentionedNotificationData = await prisma.unreadMentionedNotification.create({
            data: {
                mentionedUserId: mentionedUserId,
                relatedHistoryId: id,
            }
        });

        gqlPubSub.publish(`UNREAD_MENTIONED_NOTIFICATION_CREATED_${mentionedUserId}`, { unreadMentionedNotificationCreated: unreadMentionedNotificationData });
    }

    async pushToRobotHook(payload: any) {

        const { post, mentionHistory } = payload;

        const { mentionedUserId } = mentionHistory;

        const robotUser = await this.pubSub.prisma.user.findUnique(
            {
                where: { id: mentionedUserId },
                select: {
                    relatedRobot: {
                        select:
                        {
                            hookUrl: true,
                            headers: true
                        }
                    }
                }
            }
        );

        const hookData = {
            post,
            mentionHistory
        };

        const headers = robotUser.relatedRobot.headers.map((h, i) => {
            return { key: h.key, value: h.value }
        });

        if (robotUser.relatedRobot.hookUrl) {
            await this.pubSub.proxyHookHttp.sendRequest({ url: robotUser.relatedRobot.hookUrl, data: hookData, headers: headers, });
        }
    }


    start() {
        this.pubSub.subscribe('user', 'mentioned', this.pushNotification.bind(this));
        this.pubSub.subscribe('robot', 'mentioned', this.pushToRobotHook.bind(this));
    }

    stop() {
        this.pubSub.unsubscribe('user', 'mentioned', this.pushNotification);
        this.pubSub.unsubscribe('robot', 'mentioned', this.pushToRobotHook);
    }
}