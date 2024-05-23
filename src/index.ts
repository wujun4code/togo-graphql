import { ApolloServer } from '@apollo/server';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ServerContext, KeycloakAccessTokenUser, ExtendedUserInterface, SessionContext } from './contracts/index.js';
import {
    LocationDataSource, WeatherDataSource, AirDataSource,
    IRESTDataSourceConfig, OpenWeatherMap, PrismaDataSource,
    TravelPlanDataSource, WebHookDataSource, LocationPointDataSource,
    ACLDataSource, PostDataSource, UserDataSource, FollowDataSource,
    RobotDataSource, MentionHistoryDataSource, NotificationDataSource,
} from './datasources/index.js';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ACL } from './decorators/index.js';
import { WebHookService, UserTokenService, GitHubOAuth2Provider, GoogleOAuth2Provider, PubSubService, BuiltInPubSubManager, ProxyHookHttp, APIClientOAuth2Provider } from './services/index.js';
import http from 'http';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config'
import { PrismaClient } from '@prisma/client';
import { isbot } from "isbot";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import { router as OpenAIRouter } from './services/robot/openai.js';

const app = express();
app.use('/openai', OpenAIRouter);

const gqlPubSub = new PubSub();

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query",
        }
    ]
});

prisma.$on("query", async (e) => {
    //console.log(`${e.query} ${e.params}`)
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

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Creating the WebSocket server
const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
});

const server = new ApolloServer<ServerContext>({
    schema,
    cache: new InMemoryLRUCache(),
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginCacheControl({ defaultMaxAge: 0 }),
        responseCachePlugin(),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },],
});

const serverCleanup = useServer({
    schema, context: (ctx, message, args) => {
        //console.log(`authentication:${JSON.stringify(ctx.connectionParams)}`);
        let accessToken: string | null = null;
        let provider: string = null;
        let clientId: string = null;

        if (ctx.connectionParams.Authorization) {

            const token = ctx.connectionParams.Authorization as string;

            if (token && token.toLowerCase().startsWith('bearer ')) {
                accessToken = token.slice(7).trim();
                provider = ctx.connectionParams['x-oauth2-token-provider'] as string || "default";
                clientId = ctx.connectionParams['x-oauth2-client-id'] as string;
            }
        }

        const data = { accessToken, provider, clientId };

        const user = extractUser(data);

        const session = { user: user };
        const contextValue = createServerContext(session);
        //ctx['pubSub'] = gqlPubSub;

        return { ctx, message, args, ...contextValue };
    },
}, wsServer);

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
        accessToken = authHeader.slice(7).trim();
        provider = req.headers[tokenProviderKey] as string || "default";
        clientId = req.headers[clientIdKey] as string
    }

    const data = { accessToken, provider, clientId };
    //console.log(`extractToken:${JSON.stringify(data)}`);
    return data;
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
    const spilt = token.split('.');
    if (spilt.length < 2) return null;
    return JSON.parse(Buffer.from(spilt[1], 'base64').toString());
}

function extractUser({ accessToken, provider, clientId }: { accessToken: string, provider: string, clientId: string }) {
    if (accessToken) {

        switch (provider) {
            case 'keycloak':
                {
                    const keycloakAccessToken = parseJwt(accessToken as string);

                    const oauth2User = new KeycloakAccessTokenUser(clientId, keycloakAccessToken);

                    // console.log(`oauth2User:${JSON.stringify(oauth2User)}`);
                    const user: ExtendedUserInterface = {
                        ...oauth2User,
                        extendedRoles: []
                    };

                    return user;
                }

            default: {
                //console.log(`accessToken:${JSON.stringify(accessToken)}`);
                const payload = parseJwt(accessToken);
                if (payload == null) return null;
                //console.log(`oauth2User:${JSON.stringify(payload)}`);
                const user: ExtendedUserInterface = {
                    ...payload,
                    extendedRoles: []
                };

                return user;
            }
        }
    }
    return null;
}

const createServerContext = (session: SessionContext) => {
    const { cache } = server;

    const acl = new ACL();

    const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

    const prismaConfig = { client: prisma, session: session };
    const proxyHookHttp = new ProxyHookHttp(prismaConfig);
    const webHookDataSource = new WebHookDataSource(prismaConfig);
    const webHookService = new WebHookService({ prisma, session, proxyHookHttp });
    webHookService.start();

    const pubSub = new PubSubService({ prisma, session, gqlPubSub, proxyHookHttp });

    const pubSubManager = new BuiltInPubSubManager({ pubSub: pubSub })
    pubSubManager.startAllSubWorkers();

    const jwt = new UserTokenService();
    jwt.use(new GitHubOAuth2Provider(), 'github');
    jwt.use(new GoogleOAuth2Provider(), 'google');
    jwt.use(new APIClientOAuth2Provider(prismaConfig), 'api-client');

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
            robot: new RobotDataSource(prismaConfig),
            mentionHistory: new MentionHistoryDataSource(prismaConfig),
            notification: new NotificationDataSource(prismaConfig),

        },
        services: {
            acl,
            webHook: webHookService,
            jwt: jwt,
            pubSub: pubSub,
            pubSubManager: pubSubManager,
            gqlPubSub: gqlPubSub,
            proxyHookHttp: proxyHookHttp,
        }
    };
    return contextValue;
};

app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    //blockBot(),
    //extractTokenMiddleware(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req, res }) => {

            const accessToken = extractToken(req, res);

            const user = extractUser(accessToken);

            const http = { req, res };

            //console.log(`user: ${user.name}:${JSON.stringify(user.roles)}`);
            const session = { user: user, http: http };

            const contextValue: ServerContext = createServerContext(session);

            res.on('finish', async () => {
                //console.log(`Response sent for ${req.method} ${req.url}`);
                //pubSubManager.unsubscribeAll();
            });
            return contextValue;
        },
    }),
);

// Modified server startup

const PORT = process.env.PORT || 4000;
await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);