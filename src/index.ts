import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ServerContext, KeycloakAccessTokenUser } from './contracts/index.js';
import { LocationDataSource, WeatherDataSource, AirDataSource, IRESTDataSourceConfig, OpenWeatherMap } from './datasources/index.js';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { DataSourceConfig } from '@apollo/datasource-rest';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ACL } from './decorators/index.js';
import http from 'http';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config'

const PORT = process.env.PORT || 4000;

const app = express();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ... you will write your Prisma Client queries here
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });

const httpServer = http.createServer(app);

const server = new ApolloServer<ServerContext>({
    typeDefs: typeDefs,
    resolvers: resolvers,
    cache: new InMemoryLRUCache(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginCacheControl({ defaultMaxAge: 30 }), responseCachePlugin()],
});

await server.start();

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

app.get('/feed', async (req, res) => {
    const posts = await prisma.post.findMany({
        where: { published: true },
        include: { author: true },
    })
    res.json(posts)
});

app.use(
    '/',
    cors<cors.CorsRequest>(),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const { cache } = server;

            const forwardedToken = req.headers['x-forwarded-access-token'] || '';

            const keycloakAccessToken = parseJwt(forwardedToken as string);

            const user = new KeycloakAccessTokenUser(process.env.KEYCLOAK_RESOURCE, keycloakAccessToken);

            //console.log(`user: ${user.name}:${JSON.stringify(user.roles)}`);
            const session = { user: user };

            const acl = new ACL();

            const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

            const contextValue: ServerContext = {
                http: { req, res },
                session: session,
                dataSources: {
                    location: new LocationDataSource(restDataSourceConfig),
                    weather: new WeatherDataSource(restDataSourceConfig),
                    air: new AirDataSource(restDataSourceConfig),
                    owmWeather: new OpenWeatherMap.WeatherDataSource(restDataSourceConfig),
                },
                services: { acl }
            };

            return contextValue;
        },
    }),
);

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${PORT}/`);

// const { url } = await startStandaloneServer(server, {
//     context: async ({ req, res }) => {
//         const { cache } = server;
//         const token = req.headers.authorization || '';

//         const userDataSource = new UserDataSource();
//         const acl = new ACL();

//         const user = await userDataSource.getUserFor(token);

//         const session = { user };

//         const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

//         const contextValue: ServerContext = {
//             http: { req, res },
//             session: session,
//             dataSources: {
//                 location: new LocationDataSource(restDataSourceConfig),
//                 weather: new WeatherDataSource(restDataSourceConfig),
//                 user: userDataSource,
//             },
//             services: { acl }
//         };

//         return contextValue;
//     },
//     listen: { port: 4000 },
// });

//console.log(`🚀  Server ready at: ${url}`);