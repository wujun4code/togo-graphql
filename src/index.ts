import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ServerContext, KeycloakAccessTokenUser, ExtendedUserInterface } from './contracts/index.js';
import {
    LocationDataSource, WeatherDataSource, AirDataSource,
    IRESTDataSourceConfig, OpenWeatherMap, PrismaDataSource,
    TravelPlanDataSource, WebHookDataSource, LocationPointDataSource,
    ACLDataSource, PostDataSource, UserDataSource, FollowDataSource
} from './datasources/index.js';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { DataSourceConfig } from '@apollo/datasource-rest';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ACL } from './decorators/index.js';
import { WebHookService } from './services/index.js';
import http from 'http';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config'
import { PrismaClient } from '@prisma/client';
import { isbot } from "isbot";
const PORT = process.env.PORT || 4000;

const app = express();

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query",
        }
    ]
});

prisma.$on("query", async (e) => {
    console.log(`${e.query} ${e.params}`)
});

async function main() {

}

// await main().then(async () => {
//     await prisma.$disconnect();
// }).catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
// });

const httpServer = http.createServer(app);

const server = new ApolloServer<ServerContext>({
    typeDefs: typeDefs,
    resolvers: resolvers,
    cache: new InMemoryLRUCache(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginCacheControl({ defaultMaxAge: 30 }), responseCachePlugin()],
});

interface CustomRequest extends Request {
    accessToken?: string;
    provider?: string;
}

const extractToken = (req: CustomRequest, res: Response) => {
    let accessToken: string | null = null;
    let provider: string = null;
    let clientId: string = null;
    const tokenProviderKey = 'x-oauth2-token-provider';
    const clientIdKey = 'x-oauth2-client-id';

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        accessToken = authHeader.slice(7);
        provider = req.headers[tokenProviderKey].toString() || "keycloak";
        clientId = req.headers[clientIdKey].toString();
    }
    return { accessToken, provider, clientId };
}

const blockBot = () => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (isbot(req.get("user-agent"))) {
            return res.status(403).json({ error: 'Access denied for bots and crawlers' });
        }
        next();
    }
};

await server.start();

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function extractUser({ accessToken, provider, clientId }: { accessToken: string, provider: string, clientId: string }) {
    if (accessToken) {

        switch (provider) {
            case 'keycloak':
                {
                    const keycloakAccessToken = parseJwt(accessToken as string);

                    const oauth2User = new KeycloakAccessTokenUser(clientId, keycloakAccessToken);

                    console.log(`oauth2User:${JSON.stringify(oauth2User)}`);
                    const user: ExtendedUserInterface = {
                        ...oauth2User,
                        extendedRoles: []
                    };

                    return user;
                }
        }
    }
    return null;
}
app.use(
    '/',
    cors<cors.CorsRequest>(),
    express.json(),
    //blockBot(),
    //extractTokenMiddleware(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const { cache } = server;

            const accessToken = extractToken(req, res);

            const user = extractUser(accessToken);

            const http = { req, res };

            //console.log(`user: ${user.name}:${JSON.stringify(user.roles)}`);
            const session = { user: user, http: http };

            const acl = new ACL();

            const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

            const prismaConfig = { client: prisma, session: session };
            const webHookDataSource = new WebHookDataSource(prismaConfig);
            const webHookService = new WebHookService({ prisma, session });
            webHookService.start();

            const contextValue: ServerContext = {
                session: session,
                dataSources: {
                    location: new LocationDataSource(restDataSourceConfig),
                    weather: new WeatherDataSource(restDataSourceConfig),
                    air: new AirDataSource(restDataSourceConfig),
                    owmWeather: new OpenWeatherMap.WeatherDataSource(restDataSourceConfig),
                    prisma: new PrismaDataSource(prismaConfig),
                    travelPlan: new TravelPlanDataSource(prismaConfig),
                    webHook: webHookDataSource,
                    locationPoint: new LocationPointDataSource(prismaConfig),
                    acl: new ACLDataSource(prismaConfig),
                    post: new PostDataSource(prismaConfig),
                    user: new UserDataSource(prismaConfig),
                    follow: new FollowDataSource(prismaConfig),
                },
                services: { acl, webHook: webHookService }
            };

            return contextValue;
        },
    }),
);

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${PORT}/`);