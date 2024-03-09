import { checkRole, ensureUserInitialized } from '../../decorators/index.js';
import { GraphQLError } from 'graphql';
export const resolvers = {
    Query: {
        getTravelPlan: async (parent, args, context, info) => {
            return context.dataSources.travelPlan.findUnique(context, { id: parseInt(args.id) });
        },
        getAllTravelPlans: async (parent, args, context, info) => {
            checkRole(context, ['admin']);
            return context.dataSources.travelPlan.findMany(context, args.filters);
        },
        getMyTravelPlans: async (parent, args, context, info) => {
            await ensureUserInitialized(context);
            const filters = { ...args.filters, creatorId: context.session.user.id };
            return context.dataSources.travelPlan.findMany(context, filters);
        },
    },
    Mutation: {
        createTravelPlan(parent, args, context, info) {
            return context.dataSources.travelPlan.create(context, args.input);
        },
        updateTravelPlan(parent, args, context, info) {
            const { id } = args.input;
            if (!id) throw new GraphQLError(`no id found`, {
                extensions: {
                    code: 'Bad Request',
                },
            });
            return context.dataSources.travelPlan.updateUnique(context, args.input);
        },
        deleteTravelPlan(parent, args, context, info) {
            return context.dataSources.travelPlan.deleteUnique(context, { id: parseInt(args.id) });
        },
    },
    TravelPlan: {
        origin: async (parent, args, context, info) => {
            return context.dataSources.locationPoint.findUnique(context, { id: parent.originId });
        },
        destination: async (parent, args, context, info) => {
            return context.dataSources.locationPoint.findUnique(context, { id: parent.destinationId });
        },
    }
};