import { resolvers as Location } from './geo/localtion.js';
import { resolvers as Now } from './weather/now.js';

export const resolvers = [Location, Now];