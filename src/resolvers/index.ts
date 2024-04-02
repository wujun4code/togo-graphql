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
import { resolvers as Comment } from './post/comment.js';
import { resolvers as Follow } from './user/follow.js';
import { resolvers as Robot } from './robot/robot.js';

export const resolvers = [
    Location, Now,
    Hourly, Daily, AirNow,
    TravelPlan, Webhook,
    { JSON: jsonScalar },
    Post, Profile, Comment,
    Follow, Robot
];