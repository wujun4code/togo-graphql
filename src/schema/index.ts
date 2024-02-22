import { typeDefs as Location } from './geo/locatiaon.js';
import { typeDefs as Now } from './weather/now.js';
import { typeDefs as Hourly } from './weather/hourly.js';
import { typeDefs as Daily } from './weather/daily.js';

export const typeDefs = [Location, Now, Hourly, Daily];