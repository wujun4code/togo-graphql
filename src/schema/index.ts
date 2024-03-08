import { typeDefs as Location } from './geo/locatiaon.js';
import { typeDefs as Now } from './weather/now.js';
import { typeDefs as Hourly } from './weather/hourly.js';
import { typeDefs as Daily } from './weather/daily.js';
import { typeDefs as AirNow } from './air/now.js';
import { typeDefs as TravelPlan } from './travel-plan/travel-plan.js';
import { typeDefs as Webhook } from './webhook/webhook.js';
import { typeDefs as JSONScalerTypeDefs } from './json/json-scalar.js';

export const cacheDefs = `#graphql
enum CacheControlScope {
  PUBLIC
  PRIVATE
}

directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
  inheritMaxAge: Boolean
) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
`;

export const typeDefs = [
  cacheDefs, JSONScalerTypeDefs, Location,
  Now, Hourly, Daily,
  AirNow, TravelPlan,
  Webhook];