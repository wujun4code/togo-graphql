import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ServerContext, KeycloakGrantUser, KeycloakAccessTokenUser } from './contracts/index.js';
import { LocationDataSource, WeatherDataSource, UserDataSource, IRESTDataSourceConfig } from './datasources/index.js';
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
import Keycloak from 'keycloak-connect';
import { Grant } from 'keycloak-connect';
import { GraphQLError } from 'graphql';
import session from 'express-session';
import crypto from 'crypto';
import 'dotenv/config'

const PORT = process.env.port || 4000;

const app = express();

var memoryStore = new session.MemoryStore()

const keycloakConfig = {
    "confidential-port": 443,
    "realm": process.env.KEYCLOAK_REALM,
    "auth-server-url": `${process.env.KEYCLOAK_URL}`,
    "ssl-required": "external",
    "resource": process.env.KEYCLOAK_CLIENT,
    "bearer-only": true
}

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(session({
    secret: process.env.session_secret,
    // resave: false,
    // saveUninitialized: true,
    store: memoryStore
}));

const httpServer = http.createServer(app);

const server = new ApolloServer<ServerContext>({
    typeDefs: typeDefs,
    resolvers: resolvers,
    cache: new InMemoryLRUCache(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginCacheControl({ defaultMaxAge: 30 }), responseCachePlugin()],
});

await server.start();

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
            const token = req.headers.authorization || '';

            console.log(`authorization:${token}`);
            console.log(`forwardedToken:${forwardedToken}`);


            const user = await new UserDataSource().getUserFor(token);

            const session = { user: user };

            const acl = new ACL();

            const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

            const contextValue: ServerContext = {
                http: { req, res },
                session: session,
                dataSources: {
                    location: new LocationDataSource(restDataSourceConfig),
                    weather: new WeatherDataSource(restDataSourceConfig),
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