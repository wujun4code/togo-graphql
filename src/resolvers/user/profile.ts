import { withAuthentication } from '../../decorators/index.js';
export const resolvers = {
    Query: {
        profile: async (parent, args, context, info) => {
            return await context.dataSources.user.getSharedPublicProfile(context, args.input);
        },
        myProfile: withAuthentication(async (parent, args, context, info) => {
            const {
                session: { user }
            } = context;
            return await context.dataSources.user.getSharedPublicProfileByUserId(context, parseInt(user.id));
        }),
        getMyProfile: withAuthentication(async (parent, args, context, info) => {
            const {
                session: { user }
            } = context;
            return await context.dataSources.user.getSharedPublicProfileByUserId(context, parseInt(user.id));
        }),
    },
};