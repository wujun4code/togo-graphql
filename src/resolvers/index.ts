import { resolvers as Location } from './geo/localtion.js';
import { resolvers as Now } from './weather/now.js';
import { resolvers as Hourly } from './weather/hourly.js';
import { resolvers as Daily } from './weather/daily.js';

export const resolvers = [Location, Now, Hourly, Daily];