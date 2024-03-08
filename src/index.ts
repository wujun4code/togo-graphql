import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ServerContext, KeycloakAccessTokenUser } from './contracts/index.js';
import {
    LocationDataSource, WeatherDataSource, AirDataSource,
    IRESTDataSourceConfig, OpenWeatherMap, PrismaDataSource,
    TravelPlanDataSource, WebHookDataSource, LocationPointDataSource
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

const PORT = process.env.PORT || 4000;

const app = express();

const prisma = new PrismaClient();

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


const webHookService = new WebHookService({ prisma });
webHookService.start();

const httpServer = http.createServer(app);

const server = new ApolloServer<ServerContext>({
    typeDefs: typeDefs,
    resolvers: resolvers,
    cache: new InMemoryLRUCache(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginCacheControl({ defaultMaxAge: 30 }), responseCachePlugin()],
});

interface CustomRequest extends Request {
    accessToken?: string;
}

const extractToken = (req: CustomRequest, res: Response) => {
    let token: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.slice(7);
    } else if (req.headers['x-forwarded-access-token']) {
        token = req.headers['x-forwarded-access-token'] as string;
    }

    return token;
}

const extractTokenMiddleware = () => {

    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const token = extractToken(req, res);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.accessToken = token;

        next();
    }
};

await server.start();

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

app.use(
    '/',
    cors<cors.CorsRequest>(),
    express.json(),
    //extractTokenMiddleware(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const { cache } = server;

            const accessToken = extractToken(req, res);

            const keycloakAccessToken = parseJwt(accessToken as string);

            const user = new KeycloakAccessTokenUser(process.env.KEYCLOAK_RESOURCE, keycloakAccessToken);

            //console.log(`user: ${user.name}:${JSON.stringify(user.roles)}`);
            const session = { user: user };

            const acl = new ACL();

            const restDataSourceConfig: IRESTDataSourceConfig = { session: session, restConfig: { cache: cache } };

            const prismaConfig = { client: prisma, session: session };
            const webHookDataSource = new WebHookDataSource(prismaConfig);

            const contextValue: ServerContext = {
                http: { req, res },
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