import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { LocationDataSource, WeatherDataSource } from './datasources/index.js';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';

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