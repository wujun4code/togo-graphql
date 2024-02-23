import { typeDefs as Location } from './geo/locatiaon.js';
import { typeDefs as Now } from './weather/now.js';
import { typeDefs as Hourly } from './weather/hourly.js';
import { typeDefs as Daily } from './weather/daily.js';

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

export const typeDefs = [cacheDefs, Location, Now, Hourly, Daily];