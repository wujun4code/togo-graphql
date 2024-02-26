export const resolvers = {
    Query: {
        getNowByLocationId: async (parent, args, context, info) => {
            return context.dataSources.weather.getNow(context, args.locationId, args.lang);
        },
    },
};