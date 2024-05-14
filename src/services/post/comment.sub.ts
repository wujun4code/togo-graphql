import { PubSubService, SubWorker } from '../index.js';
import { parseMentions } from '../mention/parser.js';

export class CommentCreatedSubWorker implements SubWorker {

    pubSub: PubSubService;

    constructor(config: { pubSub: PubSubService }) {
        this.pubSub = config.pubSub;
    }

    //@{\"u\":\"6\",\"t\":\"马云\"} @{\"usns\":\"testRobot\",\"t\":\"马斯克\"} @{\"uoid\":\"0bb948fd-1495-4d23-8634-38335376c375\",\"t\":\"贝索斯\"} 这条推特 mention 了 3个用户，t 代表是他们的显示的名称
    async parseContent(payload: any) {
        const { comment } = payload;
        const { content, postId } = comment;

        const { gqlPubSub, prisma } = this.pubSub;

        if (content.includes('@')) {
            const mentioned = parseMentions(content);
            this.pubSub.publish('mentioned-in-comment', 'created', { comment: comment, mentioned: mentioned });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });

        gqlPubSub.publish(`COMMENT_CREATED_${post.authorId}`, { commentCreated: comment });
    }


    start() {
        this.pubSub.subscribe('comment', 'created', this.parseContent.bind(this));
    }

    stop() {
        this.pubSub.unsubscribe('comment', 'created', this.parseContent);
    }
}