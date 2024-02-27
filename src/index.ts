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
import express, { Request, Response } from 'express';
import Keycloak from 'keycloak-connect';
import { Grant } from 'keycloak-connect';
import { GraphQLError } from 'graphql';
import session from 'express-session';

import 'dotenv/config'

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

app.use(keycloak.middleware());


// API route with Keycloak protection
app.get('/api', keycloak.protect(), (req: Request, res: Response) => {
    // Accessing user information from the Keycloak token
    // @ts-ignore
    const username = req.kauth.grant.access_token.content.preferred_username;
    // @ts-ignore
    const roles = req.kauth.grant.access_token.content.realm_access.roles;

    res.json({ username, roles });
});

app.use(
    '/',
    cors<cors.CorsRequest>(),
    express.json(),
    //keycloak.middleware(),
    keycloak.protect(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const { cache } = server;
            const token = req.headers.authorization || '';
            // @ts-ignore
            console.log(`req.kauth`, `${JSON.stringify(req.kauth)}`);
            // @ts-ignore
            if (req.kauth.grant == undefined) {
                throw new GraphQLError(`invalid access token`, {
                    extensions: {
                        code: 'Unauthorized',
                    },
                });
            }
            // @ts-ignore
            console.log(`access_token.content`, `${JSON.stringify(req.kauth.grant.access_token.content)}`);

            // let grant: Grant = null;

            // try {
            //     grant = await keycloak.getGrant(req, res);
            // }
            // catch (error) {
            //     console.warn(error);
            //     throw new GraphQLError(`invalid access token`, {
            //         extensions: {
            //             code: 'Unauthorized',
            //         },
            //     });
            // }

            // const keycloakGrantUser = new KeycloakGrantUser(grant);

            // @ts-ignore

            const keycloakAccessTokenUser = new KeycloakAccessTokenUser(keycloakConfig.resource, req.kauth.grant.access_token.content);

            const session = { user: keycloakAccessTokenUser };

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

const port = process.env.port || 4000;

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: port }, resolve));

console.log(`🚀 Server ready at http://localhost:${port}/`);

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