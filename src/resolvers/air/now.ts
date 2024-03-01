export const resolvers = {
    Query: {
        getAirByLocationId: async (parent, args, context, info) => {
            const now = context.dataSources.air.getNow(context, args.locationId, args.lang);
            return { now };
        },
    },
};