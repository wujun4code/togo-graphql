import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { LocationDataSource, WeatherDataSource } from './datasources/index.js';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';

import 'dotenv/config'

export interface ContextValue {
    dataSources: {
        location: LocationDataSource;
        weather: WeatherDataSource
    };
}

const server = new ApolloServer<ContextValue>({
    typeDefs: typeDefs,
    resolvers: resolvers,
    cache: new InMemoryLRUCache(),
    plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 30 }), responseCachePlugin()],
});

const { url } = await startStandaloneServer(server, {
    context: async () => {
        const { cache } = server;
        return {
            dataSources: {
                location: new LocationDataSource({ cache }),
                weather: new WeatherDataSource({ cache }),
            },
        };
    },
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);