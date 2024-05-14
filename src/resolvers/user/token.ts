import { withAuthentication } from '../../decorators/index.js';

export const resolvers = {
    Query: {
        authentication: async (parent, args, context, info) => {
            const { basic, extra } = await context.services.jwt.getProfile(args.input);
            const jwt = await context.services.jwt.getJwt(basic);
            return { jwt, basic, extra };
        },
    },
    Authentication: {
        profile: async (parent, args, context, info) => {
            const { basic, extra } = parent;
            const { id } = await context.dataSources.user.createOrGetUser(context, { basic, extra });
            return await context.dataSources.user.getMyProfileByUserId(context, { userId: id });
        },
    },
    Mutation: {
        createAPIClient: withAuthentication(async (parent, args, context, info) => {
            const {
                session: { user }
            } = context;
            
            return await context.dataSources.user.createAPIClient(context, { userId: parseInt(user.id), ...args.input });
        }),
    }
};