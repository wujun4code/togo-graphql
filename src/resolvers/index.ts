import { resolvers as Location } from './geo/localtion.js';
import { resolvers as Now } from './weather/now.js';
import { resolvers as Hourly } from './weather/hourly.js';
import { resolvers as Daily } from './weather/daily.js';
import { resolvers as AirNow } from './air/now.js';
import { resolvers as TravelPlan } from './travel-plan/travel-plan.js';
import { resolvers as Webhook } from './webhook/webhook.js';
import { jsonScalar } from './json/json-scalar.js';
import { resolvers as Post } from './post/post.js';
import { resolvers as Profile } from './user/profile.js';
import { resolvers as PostComment } from './post/comment.js';
import { resolvers as Follow } from './user/follow.js';
import { resolvers as Robot } from './robot/robot.js';
import { resolvers as Mention } from './user/mention.js';
import { resolvers as SubscriptionMentioned } from './notification/mentioned.js';
import { resolvers as Token } from './user/token.js';
import { resolvers as Unread } from './notification/unread.js';
import { resolvers as SubscriptionComment } from './notification/comment.js';

export const resolvers = [
    Location, Now,
    Hourly, Daily, AirNow,
    TravelPlan, Webhook,
    { JSON: jsonScalar },
    Post, PostComment, Profile,
    Follow, Robot, Mention,
    SubscriptionMentioned,
    Token, Unread, SubscriptionComment
];