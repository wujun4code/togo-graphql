export const resolvers = {
    Query: {
        getNowByLocationId: async (parent, args, context, info) => {
            return context.dataSources.weather.getNow(context, args.locationId, args.lang);
        },
        getNowByLocation: async (parent, args, context, info) => {
            return context.dataSources.owmWeather.getNow(context, args.location, args.lang);
        },
    },
};