import { checkRole, ensureUserInitialized } from '../../decorators/index.js';
export const resolvers = {
    Query: {
        getTravelPlan: async (parent, args, context, info) => {
            return context.dataSources.travelPlan.create(context, { data: args.input });
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
            return context.dataSources.weather.forecastHourly(parent.id, args.lang, args.hourly, args.limit);
        },
        deleteTravelPlan(parent, args, context, info) {
            return context.dataSources.weather.forecastDaily(context, parent.id, args.lang, args.daily, args.limit);
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